import * as xray from "@distilled.cloud/aws/xray";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
/**
 * An X-Ray resource policy — an account-level, resource-based IAM policy
 * that grants other Amazon Web Services services and accounts access to
 * X-Ray, e.g. allowing SNS active tracing to send trace segments.
 *
 * Resource policies are not taggable; ownership is keyed by the
 * deterministic policy name.
 * ### Creating Resource Policies
 * **Example:** Allow SNS active tracing to send trace data
 * ```typescript
 * import * as XRay from "alchemy/AWS/XRay";
 *
 * const policy = yield* XRay.ResourcePolicy("SnsActiveTracing", {
 *   policyDocument: JSON.stringify({
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { Service: "sns.amazonaws.com" },
 *         Action: ["xray:PutTraceSegments", "xray:GetSamplingRules"],
 *         Resource: "*",
 *       },
 *     ],
 *   }),
 * });
 * ```
 *
 * @resource
 */
export const ResourcePolicy = Resource("AWS.XRay.ResourcePolicy");
/** Order-insensitive canonical form of a JSON policy document. */
const canonicalJson = (document) => {
    const sort = (value) => Array.isArray(value)
        ? value.map(sort)
        : value !== null && typeof value === "object"
            ? Object.fromEntries(Object.entries(value)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([k, v]) => [k, sort(v)]))
            : value;
    try {
        return JSON.stringify(sort(JSON.parse(document)));
    }
    catch {
        return document;
    }
};
export const ResourcePolicyProvider = () => Provider.effect(ResourcePolicy, Effect.gen(function* () {
    const createPolicyName = Effect.fn(function* (id, props) {
        // X-Ray policy names are limited to 128 characters.
        return (props.policyName ??
            (yield* createPhysicalName({ id, maxLength: 128 })));
    });
    // X-Ray has no GetResourcePolicy — observe by enumerating the (at
    // most 5) policies in the account and matching on the policy name.
    const observePolicy = (policyName) => xray.listResourcePolicies.items({}).pipe(Stream.filter((policy) => policy.PolicyName === policyName), Stream.runHead, Effect.map(Option.getOrUndefined));
    return ResourcePolicy.Provider.of({
        stables: ["policyName"],
        list: () => Effect.gen(function* () {
            const policies = yield* xray.listResourcePolicies
                .items({})
                .pipe(Stream.runCollect);
            return Array.from(policies).flatMap((policy) => policy.PolicyName
                ? [
                    {
                        policyName: policy.PolicyName,
                        policyRevisionId: policy.PolicyRevisionId,
                    },
                ]
                : []);
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const policyName = output?.policyName ?? (yield* createPolicyName(id, olds ?? {}));
            const found = yield* observePolicy(policyName);
            if (found === undefined)
                return undefined;
            // Resource policies are not taggable — ownership is keyed by the
            // deterministic policy name.
            return { policyName, policyRevisionId: found.PolicyRevisionId };
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* createPolicyName(id, olds ?? {});
            const newName = yield* createPolicyName(id, news ?? {});
            if (oldName !== newName) {
                return { action: "replace" };
            }
            // fall through: engine default update logic for the document
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const policyName = output?.policyName ?? (yield* createPolicyName(id, news));
            // 1. OBSERVE — the live policy list is authoritative.
            const existing = yield* observePolicy(policyName);
            // 2/3. ENSURE + SYNC — `putResourcePolicy` is a true upsert; call
            // it only when the canonical document drifts. The observed
            // revision id guards against concurrent writers; a revision race
            // surfaces as the typed InvalidPolicyRevisionIdException, which we
            // resolve by re-observing and applying once more.
            const putPolicy = (revisionId) => xray
                .putResourcePolicy({
                PolicyName: policyName,
                PolicyDocument: news.policyDocument,
                PolicyRevisionId: revisionId,
                BypassPolicyLockoutCheck: news.bypassPolicyLockoutCheck,
            })
                .pipe(Effect.map((r) => r.ResourcePolicy));
            const policy = existing?.PolicyDocument !== undefined &&
                canonicalJson(existing.PolicyDocument) ===
                    canonicalJson(news.policyDocument)
                ? existing
                : yield* putPolicy(existing?.PolicyRevisionId).pipe(Effect.catchTag("InvalidPolicyRevisionIdException", () => observePolicy(policyName).pipe(Effect.flatMap((observed) => putPolicy(observed?.PolicyRevisionId)))));
            yield* session.note(policyName);
            return { policyName, policyRevisionId: policy?.PolicyRevisionId };
        }),
        delete: Effect.fn(function* ({ output }) {
            // DeleteResourcePolicy without a revision id skips the revision
            // check and is idempotent — deleting a missing policy succeeds.
            yield* xray.deleteResourcePolicy({
                PolicyName: output.policyName,
            });
        }),
    });
}));
//# sourceMappingURL=ResourcePolicy.js.map