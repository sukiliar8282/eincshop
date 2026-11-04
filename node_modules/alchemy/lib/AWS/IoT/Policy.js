import * as iot from "@distilled.cloud/aws/iot";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { hasAlchemyTags } from "../../Tags.js";
import { readIotTags, syncIotTags } from "./internal.js";
/**
 * An AWS IoT policy that grants MQTT permissions (connect, publish,
 * subscribe, receive) to certificates and other principals.
 *
 * ### Creating a Policy
 * **Example:** Allow Publish and Subscribe
 * ```typescript
 * const policy = yield* Policy("device-policy", {
 *   policyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       { Effect: "Allow", Action: "iot:Connect", Resource: "*" },
 *       { Effect: "Allow", Action: ["iot:Publish", "iot:Receive"], Resource: "*" },
 *     ],
 *   },
 * });
 * ```
 *
 * @resource
 */
export const Policy = Resource("AWS.IoT.Policy");
const stringifyDocument = (doc) => typeof doc === "string" ? doc : JSON.stringify(doc);
// Normalize a policy document to a stable canonical JSON string for diffing.
const normalizeDocument = (doc) => {
    if (!doc)
        return "";
    try {
        return JSON.stringify(JSON.parse(doc));
    }
    catch {
        return doc;
    }
};
export const PolicyProvider = () => Provider.effect(Policy, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return (props.policyName ??
            (yield* createPhysicalName({ id, maxLength: 128 })));
    });
    return Policy.Provider.of({
        stables: ["policyName", "policyArn"],
        list: () => iot.listPolicies.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.policies ?? [])
            .filter((p) => p.policyName != null && p.policyArn != null)
            .map((p) => ({
            policyName: p.policyName,
            policyArn: p.policyArn,
        }))))),
        read: Effect.fn(function* ({ id, olds, output }) {
            const policyName = output?.policyName ?? (yield* createName(id, olds ?? {}));
            const found = yield* iot
                .getPolicy({ policyName })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            if (!found)
                return undefined;
            const attrs = {
                policyName,
                policyArn: found.policyArn,
            };
            const tags = yield* readIotTags(found.policyArn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* createName(id, olds);
            const newName = yield* createName(id, news);
            if (oldName !== newName)
                return { action: "replace" };
            return undefined;
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const policyName = output?.policyName ?? (yield* createName(id, news));
            const desiredDocument = stringifyDocument(news.policyDocument);
            // OBSERVE
            let live = yield* iot
                .getPolicy({ policyName })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            // ENSURE
            if (live === undefined) {
                yield* iot
                    .createPolicy({ policyName, policyDocument: desiredDocument })
                    .pipe(Effect.catchTag("ResourceAlreadyExistsException", () => Effect.void));
                live = yield* iot.getPolicy({ policyName });
            }
            else if (normalizeDocument(live.policyDocument) !==
                normalizeDocument(desiredDocument)) {
                // SYNC document — a new default version. IoT caps a policy at 5
                // versions, so prune the oldest non-default version first.
                const { policyVersions = [] } = yield* iot.listPolicyVersions({
                    policyName,
                });
                const nonDefault = policyVersions
                    .filter((v) => !v.isDefaultVersion && v.versionId)
                    .sort((a, b) => (a.versionId < b.versionId ? -1 : 1));
                if (policyVersions.length >= 5 && nonDefault[0]?.versionId) {
                    yield* iot
                        .deletePolicyVersion({
                        policyName,
                        policyVersionId: nonDefault[0].versionId,
                    })
                        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
                }
                yield* iot.createPolicyVersion({
                    policyName,
                    policyDocument: desiredDocument,
                    setAsDefault: true,
                });
                live = yield* iot.getPolicy({ policyName });
            }
            // SYNC tags
            yield* syncIotTags(live.policyArn, id, news.tags);
            yield* session.note(policyName);
            return {
                policyName,
                policyArn: live.policyArn,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            const policyName = output.policyName;
            // Delete all non-default versions first — deletePolicy rejects a
            // policy that still has extra versions.
            const { policyVersions = [] } = yield* iot
                .listPolicyVersions({ policyName })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed({ policyVersions: [] })));
            yield* Effect.forEach(policyVersions.filter((v) => !v.isDefaultVersion && v.versionId), (v) => iot
                .deletePolicyVersion({
                policyName,
                policyVersionId: v.versionId,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void)));
            // Detach any lingering targets (certificates/groups) before delete.
            const detachTargets = Effect.gen(function* () {
                const { targets = [] } = yield* iot
                    .listTargetsForPolicy({ policyName })
                    .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed({ targets: [] })));
                yield* Effect.forEach(targets, (target) => iot
                    .detachPolicy({ policyName, target })
                    .pipe(Effect.catchTag("InvalidRequestException", () => Effect.void)));
            });
            yield* iot.deletePolicy({ policyName }).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void), Effect.catchTag("DeleteConflictException", () => detachTargets.pipe(Effect.andThen(iot
                .deletePolicy({ policyName })
                .pipe(Effect.catchTag([
                "ResourceNotFoundException",
                "DeleteConflictException",
            ], () => Effect.void))))));
        }),
    });
}));
//# sourceMappingURL=Policy.js.map