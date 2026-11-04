import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { SecurityPolicyDocument } from "./SecurityPolicy.ts";
/** The kind of lifecycle policy. OpenSearch Serverless only defines `retention`. */
export type LifecyclePolicyType = "retention";
export interface LifecyclePolicyProps {
    /**
     * Name of the lifecycle policy (3-32 characters, lowercase). Changing the
     * name replaces the policy.
     * @default a generated physical name
     */
    policyName?: string;
    /**
     * The policy kind. OpenSearch Serverless currently only supports
     * `retention` policies. Changing the type replaces the policy.
     * @default "retention"
     */
    type?: LifecyclePolicyType;
    /**
     * The lifecycle policy document — a JSON object with `Rules` matching index
     * patterns to a retention window, e.g.
     * `{ Rules: [{ ResourceType: "index", Resource: ["index/my-collection/*"], MinIndexRetention: "30d" }] }`.
     * Use `NoMinIndexRetention: true` on a rule to retain matched indexes
     * indefinitely. Supply an object or a pre-serialized string.
     */
    policy: SecurityPolicyDocument;
    /**
     * A human-readable description of the policy.
     */
    description?: string;
}
export interface LifecyclePolicy extends Resource<"AWS.OpenSearchServerless.LifecyclePolicy", LifecyclePolicyProps, {
    /**
     * Name of the lifecycle policy.
     */
    policyName: string;
    /**
     * Policy type (`retention`).
     */
    type: string;
    /**
     * Version of the policy, used for optimistic-concurrency updates.
     */
    policyVersion: string;
    /**
     * Description of the lifecycle policy.
     */
    description?: string;
}, {}, Providers> {
}
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
export declare const LifecyclePolicy: import("../../Resource.ts").ResourceClass<LifecyclePolicy>;
export declare const LifecyclePolicyProvider: () => import("effect/Layer").Layer<Provider.Provider<LifecyclePolicy>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=LifecyclePolicy.d.ts.map