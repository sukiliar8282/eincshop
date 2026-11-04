import * as aoss from "@distilled.cloud/aws/opensearchserverless";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { canonicalizePolicy, retryWhileConflict, stringifyPolicy, } from "./internal.js";
/**
 * An Amazon OpenSearch Serverless data lifecycle policy. Retention lifecycle
 * policies control how long documents are retained in the indexes matched by
 * the policy's resource patterns — OpenSearch Serverless automatically deletes
 * documents older than the configured `MinIndexRetention`.
 *
 * Lifecycle policies are free, provision instantly, and are matched to
 * indexes by resource pattern (e.g. `index/my-collection/*`) — the collection
 * does not need to exist when the policy is created.
 *
 * ### Creating Lifecycle Policies
 * **Example:** Retain Log Indexes for 30 Days
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const retention = yield* AWS.OpenSearchServerless.LifecyclePolicy("Retention", {
 *   policyName: "logs-retention",
 *   policy: {
 *     Rules: [
 *       {
 *         ResourceType: "index",
 *         Resource: ["index/logs/*"],
 *         MinIndexRetention: "30d",
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * **Example:** Unlimited Retention for Specific Indexes
 * ```typescript
 * const keepForever = yield* AWS.OpenSearchServerless.LifecyclePolicy("KeepForever", {
 *   policyName: "audit-retention",
 *   policy: {
 *     Rules: [
 *       {
 *         ResourceType: "index",
 *         Resource: ["index/audit/*"],
 *         NoMinIndexRetention: true,
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * @resource
 */
export const LifecyclePolicy = Resource("AWS.OpenSearchServerless.LifecyclePolicy");
const LIFECYCLE_POLICY_TYPE = "retention";
export const LifecyclePolicyProvider = () => Provider.effect(LifecyclePolicy, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return (props.policyName ??
            (yield* createPhysicalName({ id, maxLength: 32, lowercase: true })));
    });
    const toAttributes = (detail) => ({
        policyName: detail.name,
        type: detail.type,
        policyVersion: detail.policyVersion,
        description: detail.description,
    });
    // batchGetLifecyclePolicy reports a missing policy in
    // lifecyclePolicyErrorDetails instead of failing, which observe treats
    // as "not present".
    const observe = Effect.fn(function* (type, name) {
        const response = yield* aoss.batchGetLifecyclePolicy({
            identifiers: [{ type, name }],
        });
        return response.lifecyclePolicyDetails?.[0];
    });
    return LifecyclePolicy.Provider.of({
        stables: ["policyName", "type"],
        list: () => Effect.gen(function* () {
            const pages = yield* aoss.listLifecyclePolicies
                .pages({ type: LIFECYCLE_POLICY_TYPE })
                .pipe(Stream.runCollect);
            return Array.from(pages)
                .flatMap((page) => page.lifecyclePolicySummaries ?? [])
                .filter((s) => s.name !== undefined &&
                s.type !== undefined &&
                s.policyVersion !== undefined)
                .map((s) => ({
                policyName: s.name,
                type: s.type,
                policyVersion: s.policyVersion,
                description: s.description,
            }));
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const name = output?.policyName ?? (yield* createName(id, olds ?? {}));
            const detail = yield* observe(LIFECYCLE_POLICY_TYPE, name);
            if (detail?.name === undefined) {
                return undefined;
            }
            // Lifecycle policies carry no tags, so an existing same-name policy
            // is adopted.
            return toAttributes(detail);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            if ((olds.type ?? LIFECYCLE_POLICY_TYPE) !==
                (news.type ?? LIFECYCLE_POLICY_TYPE)) {
                return { action: "replace" };
            }
            const oldName = yield* createName(id, olds);
            const newName = yield* createName(id, news);
            if (oldName !== newName) {
                return { action: "replace" };
            }
            // description/policy fall through to the default update path
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const type = news.type ?? LIFECYCLE_POLICY_TYPE;
            const name = output?.policyName ?? (yield* createName(id, news));
            const policy = stringifyPolicy(news.policy);
            // 1. OBSERVE
            let detail = yield* observe(type, name);
            // 2. ENSURE — create if missing; tolerate a concurrent create race
            if (detail?.name === undefined) {
                detail = yield* aoss
                    .createLifecyclePolicy({
                    type,
                    name,
                    policy,
                    description: news.description,
                })
                    .pipe(Effect.map((r) => r.lifecyclePolicyDetail), Effect.catchTag("ConflictException", () => observe(type, name)));
            }
            else {
                // 3. SYNC — update policy/description when observed drifts from desired
                const policyDrift = canonicalizePolicy(detail.policy) !== canonicalizePolicy(policy);
                const descriptionDrift = news.description !== undefined &&
                    news.description !== detail.description;
                if (policyDrift || descriptionDrift) {
                    detail = yield* aoss
                        .updateLifecyclePolicy({
                        type,
                        name,
                        policyVersion: detail.policyVersion,
                        policy: policyDrift ? policy : undefined,
                        description: descriptionDrift ? news.description : undefined,
                    })
                        .pipe(Effect.map((r) => r.lifecyclePolicyDetail));
                }
            }
            if (detail?.name === undefined) {
                return yield* Effect.fail(new aoss.ResourceNotFoundException({
                    message: `lifecycle policy ${type}/${name} not visible after reconcile`,
                }));
            }
            yield* session.note(`${type}/${name}`);
            return toAttributes(detail);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* retryWhileConflict(aoss.deleteLifecyclePolicy({
                type: output.type,
                name: output.policyName,
            })).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=LifecyclePolicy.js.map