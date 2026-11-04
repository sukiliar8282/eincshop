import * as redshiftserverless from "@distilled.cloud/aws/redshift-serverless";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { readTags, syncTags, toWireTags } from "./internal.js";
/**
 * An Amazon Redshift Serverless workgroup — the compute half of a serverless
 * data warehouse.
 *
 * A workgroup provides on-demand compute (measured in RPUs) against a
 * {@link Namespace}'s data. Creating a workgroup is asynchronous and takes
 * roughly 2-5 minutes; the provider waits (bounded) for it to become
 * `AVAILABLE`. Because a running workgroup bills against its RPU floor, tear
 * it down promptly when you are done.
 *
 * ### Creating a Workgroup
 * **Example:** Minimal (Cheapest) Workgroup
 * ```typescript
 * const namespace = yield* RedshiftServerless.Namespace("Analytics", {
 *   adminUsername: "admin",
 *   manageAdminPassword: true,
 * });
 * const workgroup = yield* RedshiftServerless.Workgroup("AnalyticsWg", {
 *   namespaceName: namespace.namespaceName,
 *   baseCapacity: 8,
 * });
 * // workgroup.endpointAddress -> "<wg>.<account>.<region>.redshift-serverless.amazonaws.com"
 * ```
 *
 * ### Networking
 * **Example:** Publicly Accessible with Explicit Subnets
 * ```typescript
 * const workgroup = yield* RedshiftServerless.Workgroup("AnalyticsWg", {
 *   namespaceName: namespace.namespaceName,
 *   baseCapacity: 8,
 *   publiclyAccessible: true,
 *   subnetIds: [subnetA.subnetId, subnetB.subnetId, subnetC.subnetId],
 *   securityGroupIds: [securityGroup.groupId],
 *   enhancedVpcRouting: false,
 * });
 * ```
 *
 * @resource
 */
export const Workgroup = Resource("AWS.RedshiftServerless.Workgroup");
class WorkgroupNotSettled extends Data.TaggedError("WorkgroupNotSettled") {
}
const statusIs = (status, expected) => status?.toUpperCase() === expected;
const sameStringSet = (a, b) => {
    const as = [...a].sort();
    const bs = [...b].sort();
    return as.length === bs.length && as.every((v, i) => v === bs[i]);
};
const toConfigList = (config) => config === undefined
    ? undefined
    : Object.entries(config).map(([parameterKey, parameterValue]) => ({
        parameterKey,
        parameterValue,
    }));
export const WorkgroupProvider = () => Provider.effect(Workgroup, Effect.gen(function* () {
    const toName = (id, props) => props.workgroupName
        ? Effect.succeed(props.workgroupName)
        : createPhysicalName({ id, maxLength: 64 });
    const readWorkgroup = Effect.fn(function* (name) {
        const response = yield* redshiftserverless
            .getWorkgroup({ workgroupName: name })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
        return response?.workgroup;
    });
    // Workgroup create/update converge through CREATING/MODIFYING. Creation
    // takes ~2-5 min; budget ~8 min (96 * 5s).
    const waitForAvailable = Effect.fn(function* (name) {
        return yield* readWorkgroup(name).pipe(Effect.flatMap((wg) => wg !== undefined && !statusIs(wg.status, "AVAILABLE")
            ? Effect.fail(new WorkgroupNotSettled({
                workgroupName: name,
                status: wg.status ?? "UNKNOWN",
            }))
            : Effect.succeed(wg)), Effect.retry({
            while: (e) => e instanceof WorkgroupNotSettled,
            schedule: Schedule.max([
                Schedule.fixed("5 seconds"),
                Schedule.recurs(96),
            ]),
        }));
    });
    const waitUntilGone = Effect.fn(function* (name) {
        yield* readWorkgroup(name).pipe(Effect.flatMap((wg) => wg === undefined
            ? Effect.void
            : Effect.fail(new WorkgroupNotSettled({
                workgroupName: name,
                status: wg.status ?? "DELETING",
            }))), Effect.retry({
            while: (e) => e instanceof WorkgroupNotSettled,
            schedule: Schedule.max([
                Schedule.fixed("5 seconds"),
                Schedule.recurs(96),
            ]),
        }));
    });
    const toAttrs = (wg) => ({
        workgroupName: wg.workgroupName,
        workgroupArn: wg.workgroupArn,
        workgroupId: wg.workgroupId,
        namespaceName: wg.namespaceName,
        status: wg.status ?? "UNKNOWN",
        endpointAddress: wg.endpoint?.address,
        endpointPort: wg.endpoint?.port,
        publiclyAccessible: wg.publiclyAccessible,
    });
    // Redshift Serverless rejects multi-parameter updates: "You can't
    // update multiple parameters in one request." Apply each drifted field
    // as its own updateWorkgroup call, waiting for AVAILABLE between them.
    const applyUpdate = Effect.fn(function* (name, patch) {
        yield* redshiftserverless.updateWorkgroup({
            workgroupName: name,
            ...patch,
        });
        return yield* waitForAvailable(name);
    });
    return {
        stables: ["workgroupName", "workgroupArn", "workgroupId"],
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return undefined;
            if ((yield* toName(id, olds ?? {})) !== (yield* toName(id, news ?? {}))) {
                return { action: "replace" };
            }
            // A workgroup can't be reassigned to another namespace.
            if ((news?.namespaceName ?? undefined) !==
                (olds?.namespaceName ?? undefined)) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const name = output?.workgroupName ?? (yield* toName(id, olds ?? {}));
            const wg = yield* readWorkgroup(name);
            if (wg === undefined)
                return undefined;
            const attrs = toAttrs(wg);
            const tags = yield* readTags(attrs.workgroupArn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const name = output?.workgroupName ?? (yield* toName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            const baseCapacity = news.baseCapacity ?? 8;
            // 1. Observe.
            let observed = yield* readWorkgroup(name);
            // 2. Ensure — create if missing; tolerate a concurrent create.
            if (observed === undefined) {
                const created = yield* redshiftserverless
                    .createWorkgroup({
                    workgroupName: name,
                    namespaceName: news.namespaceName,
                    baseCapacity,
                    maxCapacity: news.maxCapacity,
                    enhancedVpcRouting: news.enhancedVpcRouting,
                    publiclyAccessible: news.publiclyAccessible,
                    subnetIds: news.subnetIds,
                    securityGroupIds: news.securityGroupIds,
                    port: news.port,
                    configParameters: toConfigList(news.configParameters),
                    tags: toWireTags(desiredTags),
                })
                    .pipe(Effect.map((r) => r.workgroup), Effect.catchTag("ConflictException", () => redshiftserverless
                    .getWorkgroup({ workgroupName: name })
                    .pipe(Effect.map((r) => r.workgroup))));
                observed = created;
            }
            const settled = yield* waitForAvailable(name);
            if (settled !== undefined)
                observed = settled;
            if (observed === undefined) {
                return yield* Effect.fail(new Error(`Redshift workgroup '${name}' disappeared while reconciling`));
            }
            // 3. Sync — one updateWorkgroup per drifted field (multi-field
            // updates are rejected). Only mutate fields the user specified.
            if (news.baseCapacity !== undefined &&
                observed.baseCapacity !== baseCapacity) {
                observed = (yield* applyUpdate(name, { baseCapacity })) ?? observed;
            }
            if (news.enhancedVpcRouting !== undefined &&
                observed.enhancedVpcRouting !== news.enhancedVpcRouting) {
                observed =
                    (yield* applyUpdate(name, {
                        enhancedVpcRouting: news.enhancedVpcRouting,
                    })) ?? observed;
            }
            if (news.publiclyAccessible !== undefined &&
                observed.publiclyAccessible !== news.publiclyAccessible) {
                observed =
                    (yield* applyUpdate(name, {
                        publiclyAccessible: news.publiclyAccessible,
                    })) ?? observed;
            }
            if (news.port !== undefined && observed.port !== news.port) {
                observed =
                    (yield* applyUpdate(name, { port: news.port })) ?? observed;
            }
            if (news.securityGroupIds !== undefined &&
                !sameStringSet(observed.securityGroupIds ?? [], news.securityGroupIds)) {
                observed =
                    (yield* applyUpdate(name, {
                        securityGroupIds: news.securityGroupIds,
                    })) ?? observed;
            }
            // 3b. Sync tags — diff against OBSERVED cloud tags.
            yield* syncTags(observed.workgroupArn, desiredTags);
            // 4. Return fresh attributes.
            yield* session.note(name);
            return toAttrs(observed);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* redshiftserverless
                .deleteWorkgroup({ workgroupName: output.workgroupName })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void), 
            // A concurrent modification may still be settling — retry.
            Effect.retry({
                while: (e) => e._tag === "ConflictException",
                schedule: Schedule.max([
                    Schedule.fixed("5 seconds"),
                    Schedule.recurs(24),
                ]),
            }), Effect.catchTag("ConflictException", () => Effect.void));
            yield* waitUntilGone(output.workgroupName);
        }),
        list: () => redshiftserverless.listWorkgroups.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
            .flatMap((page) => page.workgroups ?? [])
            .flatMap((wg) => wg.workgroupName !== undefined &&
            wg.workgroupArn !== undefined &&
            wg.workgroupId !== undefined &&
            wg.namespaceName !== undefined
            ? [
                {
                    workgroupName: wg.workgroupName,
                    workgroupArn: wg.workgroupArn,
                    workgroupId: wg.workgroupId,
                    namespaceName: wg.namespaceName,
                    status: wg.status ?? "UNKNOWN",
                    endpointAddress: wg.endpoint?.address,
                    endpointPort: wg.endpoint?.port,
                    publiclyAccessible: wg.publiclyAccessible,
                },
            ]
            : []))),
    };
}));
//# sourceMappingURL=Workgroup.js.map