import * as eks from "@distilled.cloud/aws/eks";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags } from "../../Tags.js";
/**
 * An Amazon EKS Fargate profile — declares which pods (by namespace + labels)
 * run on AWS Fargate serverless compute instead of on EC2 nodes.
 *
 * Fargate profiles are immutable except for tags: any change to selectors, the
 * pod execution role, or subnets forces a replacement. Create and delete are
 * asynchronous (`CREATING` → `ACTIVE`, `DELETING` → gone, ~1–2 min each) and the
 * provider waits for the terminal state. EKS allows only one Fargate profile per
 * cluster to be creating or deleting at a time, so the provider retries the
 * `ResourceInUseException` that surfaces when a peer profile operation is in
 * flight.
 *
 * **Fargate pods must run in private subnets** — pass private subnet IDs only.
 * ### Creating Fargate Profiles
 * **Example:** Run the `default` Namespace on Fargate
 * ```typescript
 * const profile = yield* FargateProfile("DefaultFargate", {
 *   clusterName: cluster.clusterName,
 *   podExecutionRoleArn: podRole.roleArn,
 *   subnets: network.privateSubnetIds,
 *   selectors: [{ namespace: "default" }],
 * });
 * ```
 *
 * **Example:** Select Pods by Namespace and Labels
 * ```typescript
 * const profile = yield* FargateProfile("BatchFargate", {
 *   clusterName: cluster.clusterName,
 *   podExecutionRoleArn: podRole.roleArn,
 *   subnets: network.privateSubnetIds,
 *   selectors: [
 *     { namespace: "batch", labels: { compute: "fargate" } },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export const FargateProfile = Resource("AWS.EKS.FargateProfile");
class FargateProfileNotReady extends Data.TaggedError("EKS.FargateProfileNotReady") {
}
class FargateProfileStillExists extends Data.TaggedError("EKS.FargateProfileStillExists") {
}
class FargateProfileBusy extends Data.TaggedError("EKS.FargateProfileBusy") {
}
const normalizeTags = (tags) => Object.fromEntries(Object.entries(tags ?? {}).filter((entry) => entry[1] !== undefined));
// ~10 min at 5s spacing — Fargate profile transitions complete in 1–2 min.
const waitSchedule = Schedule.max([
    Schedule.spaced("5 seconds"),
    Schedule.recurs(120),
]);
// One profile per cluster may be creating/deleting at a time; back off on the
// ResourceInUseException that peer operations raise (bounded).
const busySchedule = Schedule.max([
    Schedule.spaced("10 seconds"),
    Schedule.recurs(30),
]);
const mapFargateProfile = (profile, tags) => ({
    fargateProfileName: profile.fargateProfileName,
    fargateProfileArn: profile.fargateProfileArn,
    clusterName: profile.clusterName,
    status: profile.status ?? "CREATING",
    podExecutionRoleArn: profile.podExecutionRoleArn,
    subnets: profile.subnets ?? [],
    selectors: profile.selectors ?? [],
    tags,
});
export const FargateProfileProvider = () => Provider.effect(FargateProfile, Effect.gen(function* () {
    const toProfileName = (id, props = {}) => props.fargateProfileName
        ? Effect.succeed(props.fargateProfileName)
        : createPhysicalName({ id, maxLength: 63 });
    const toClientRequestToken = (id, action) => createPhysicalName({
        id: `${id}-${action}`,
        maxLength: 64,
        delimiter: "-",
    });
    const readProfile = Effect.fn(function* ({ clusterName, fargateProfileName, }) {
        const described = yield* eks
            .describeFargateProfile({ clusterName, fargateProfileName })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
        const profile = described?.fargateProfile;
        if (!profile?.fargateProfileArn ||
            !profile.fargateProfileName ||
            !profile.clusterName ||
            !profile.podExecutionRoleArn) {
            return undefined;
        }
        return mapFargateProfile(profile, normalizeTags(profile.tags));
    });
    const waitForProfileActive = (clusterName, fargateProfileName) => readProfile({ clusterName, fargateProfileName }).pipe(Effect.flatMap((state) => {
        if (!state) {
            return Effect.fail(new FargateProfileNotReady({ status: undefined }));
        }
        if (state.status === "ACTIVE") {
            return Effect.succeed(state);
        }
        if (state.status === "CREATE_FAILED" ||
            state.status === "DELETE_FAILED") {
            return Effect.fail(new Error(`EKS Fargate profile '${fargateProfileName}' entered ${state.status}`));
        }
        return Effect.fail(new FargateProfileNotReady({ status: state.status }));
    }), Effect.retry({
        while: (error) => error instanceof FargateProfileNotReady,
        schedule: waitSchedule,
    }));
    const waitForProfileDeleted = (clusterName, fargateProfileName) => readProfile({ clusterName, fargateProfileName }).pipe(Effect.flatMap((state) => state
        ? Effect.fail(new FargateProfileStillExists())
        : Effect.succeed(undefined)), Effect.retry({
        while: (error) => error instanceof FargateProfileStillExists,
        schedule: waitSchedule,
    }));
    return {
        stables: ["fargateProfileArn", "fargateProfileName", "clusterName"],
        // Enumerate every Fargate profile across the account/region.
        // `listFargateProfiles` is cluster-scoped, so first enumerate all
        // clusters, list each cluster's profiles, then hydrate via
        // `describeFargateProfile`.
        list: () => Effect.gen(function* () {
            const clusterNames = yield* eks.listClusters.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.clusters ?? [])));
            const perCluster = yield* Effect.forEach(clusterNames, (clusterName) => eks.listFargateProfiles.pages({ clusterName }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.fargateProfileNames ?? [])), Effect.flatMap((names) => Effect.forEach(names, (fargateProfileName) => readProfile({ clusterName, fargateProfileName }), { concurrency: 5 }))), { concurrency: 5 });
            return perCluster
                .flat()
                .filter((state) => state !== undefined);
        }),
        diff: Effect.fn(function* ({ id, olds = {}, news, }) {
            if (!isResolved(news))
                return;
            if ((yield* toProfileName(id, olds)) !==
                (yield* toProfileName(id, news ?? {}))) {
                return { action: "replace" };
            }
            if (olds.clusterName !== news.clusterName) {
                return { action: "replace" };
            }
            if (olds.podExecutionRoleArn !== news.podExecutionRoleArn) {
                return { action: "replace" };
            }
            if (JSON.stringify(olds.subnets ?? []) !==
                JSON.stringify(news.subnets ?? [])) {
                return { action: "replace" };
            }
            if (JSON.stringify(olds.selectors ?? []) !==
                JSON.stringify(news.selectors ?? [])) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const clusterName = (output?.clusterName ??
                olds?.clusterName);
            if (!clusterName)
                return undefined;
            const fargateProfileName = output?.fargateProfileName ??
                (yield* toProfileName(id, olds ?? {}));
            const state = yield* readProfile({ clusterName, fargateProfileName });
            if (!state)
                return undefined;
            return (yield* hasAlchemyTags(id, state.tags))
                ? state
                : Unowned(state);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const clusterName = news.clusterName;
            const fargateProfileName = yield* toProfileName(id, news);
            const desiredTags = {
                ...(yield* createInternalTags(id)),
                ...news.tags,
            };
            // Observe — cloud state is authoritative.
            let state = yield* readProfile({ clusterName, fargateProfileName });
            // Ensure — create if missing. A create raises ResourceInUseException
            // if another profile on the cluster is creating/deleting; back off
            // and retry. Tolerate a create race with a peer reconciler.
            if (!state) {
                yield* eks
                    .createFargateProfile({
                    clusterName,
                    fargateProfileName,
                    podExecutionRoleArn: news.podExecutionRoleArn,
                    selectors: news.selectors,
                    subnets: news.subnets,
                    tags: desiredTags,
                    clientRequestToken: yield* toClientRequestToken(id, "create"),
                })
                    .pipe(Effect.catchTag("ResourceInUseException", () => Effect.fail(new FargateProfileBusy())), Effect.retry({
                    while: (error) => error instanceof FargateProfileBusy,
                    schedule: busySchedule,
                }), Effect.catchIf((error) => error instanceof FargateProfileBusy, () => Effect.void));
                yield* session.note(`Creating EKS Fargate profile ${fargateProfileName}...`);
                state = yield* waitForProfileActive(clusterName, fargateProfileName);
            }
            // Sync tags — the only mutable aspect. Diff observed cloud tags
            // against desired.
            const { removed, upsert } = diffTags(state.tags, desiredTags);
            if (upsert.length > 0) {
                yield* eks.tagResource({
                    resourceArn: state.fargateProfileArn,
                    tags: Object.fromEntries(upsert.map((tag) => [tag.Key, tag.Value])),
                });
            }
            if (removed.length > 0) {
                yield* eks.untagResource({
                    resourceArn: state.fargateProfileArn,
                    tagKeys: removed,
                });
            }
            yield* session.note(state.fargateProfileArn);
            const final = yield* readProfile({ clusterName, fargateProfileName });
            if (!final) {
                return yield* Effect.fail(new Error(`EKS Fargate profile '${fargateProfileName}' could not be read after reconcile`));
            }
            return final;
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* eks
                .deleteFargateProfile({
                clusterName: output.clusterName,
                fargateProfileName: output.fargateProfileName,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void), 
            // A concurrent profile create/delete on the cluster raises
            // ResourceInUseException — back off and retry the delete.
            Effect.catchTag("ResourceInUseException", () => Effect.fail(new FargateProfileBusy())), Effect.retry({
                while: (error) => error instanceof FargateProfileBusy,
                schedule: busySchedule,
            }), Effect.catchIf((error) => error instanceof FargateProfileBusy, () => Effect.void));
            yield* waitForProfileDeleted(output.clusterName, output.fargateProfileName);
        }),
    };
}));
//# sourceMappingURL=FargateProfile.js.map