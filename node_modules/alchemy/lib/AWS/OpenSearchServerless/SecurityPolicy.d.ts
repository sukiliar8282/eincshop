import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/** The kind of security policy — encryption at rest or network access. */
export type SecurityPolicyType = "encryption" | "network";
/** A security policy document — a JSON object/array or a pre-serialized string. */
export type SecurityPolicyDocument = string | Record<string, unknown> | readonly unknown[];
export interface SecurityPolicyProps {
    /**
     * Name of the security policy (3-32 characters, lowercase). Must be unique
     * within its {@link SecurityPolicyProps.type | type}. Changing the name
     * replaces the policy.
     * @default a generated physical name
     */
    policyName?: string;
    /**
     * The policy kind:
     * - `encryption` — encryption-at-rest policy (a single JSON object with
     *   `Rules` and either `AWSOwnedKey` or `KmsARN`). Every collection MUST be
     *   matched by exactly one encryption policy before it can be created.
     * - `network` — network-access policy (a JSON array of rules controlling
     *   public/VPC access to the collection and Dashboards endpoints).
     *
     * Changing the type replaces the policy.
     */
    type: SecurityPolicyType;
    /**
     * The policy document. Supply a JSON object (encryption) or array (network),
     * or a pre-serialized string when you need to interpolate an `Output`-derived
     * collection name into it.
     */
    policy: SecurityPolicyDocument;
    /**
     * A human-readable description of the policy.
     */
    description?: string;
}
export interface SecurityPolicy extends Resource<"AWS.OpenSearchServerless.SecurityPolicy", SecurityPolicyProps, {
    /**
     * Name of the security policy.
     */
    policyName: string;
    /**
     * Policy type (`encryption` or `network`).
     */
    type: string;
    /**
     * Version of the policy, used for optimistic-concurrency updates.
     */
    policyVersion: string;
    /**
     * Description of the security policy.
     */
    description?: string;
}, {}, Providers> {
}
/**
 * An Amazon OpenSearch Serverless security policy. Security policies govern
 * encryption at rest (`encryption`) and network access (`network`) for one or
 * more collections, matched by a resource pattern such as
 * `collection/my-collection`.
 *
 * An **encryption** policy is a prerequisite for every collection — a
 * collection whose name is not covered by an encryption policy fails to
 * create. A **network** policy controls whether the collection's data and
 * OpenSearch Dashboards endpoints are reachable from public networks or only
 * from specific VPC endpoints.
 *
 * ### Encryption Policies
 * **Example:** AWS-Owned-Key Encryption Policy
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const encryption = yield* AWS.OpenSearchServerless.SecurityPolicy("Encryption", {
 *   policyName: "my-collection-enc",
 *   type: "encryption",
 *   policy: {
 *     Rules: [{ ResourceType: "collection", Resource: ["collection/my-collection"] }],
 *     AWSOwnedKey: true,
 *   },
 * });
 * ```
 *
 * ### Network Policies
 * **Example:** Public Network Access Policy
 * ```typescript
 * const network = yield* AWS.OpenSearchServerless.SecurityPolicy("Network", {
 *   policyName: "my-collection-net",
 *   type: "network",
 *   policy: [
 *     {
 *       Rules: [
 *         { ResourceType: "collection", Resource: ["collection/my-collection"] },
 *         { ResourceType: "dashboard", Resource: ["collection/my-collection"] },
 *       ],
 *       AllowFromPublic: true,
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export declare const SecurityPolicy: import("../../Resource.ts").ResourceClass<SecurityPolicy>;
export declare const SecurityPolicyProvider: () => import("effect/Layer").Layer<Provider.Provider<SecurityPolicy>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=SecurityPolicy.d.ts.map