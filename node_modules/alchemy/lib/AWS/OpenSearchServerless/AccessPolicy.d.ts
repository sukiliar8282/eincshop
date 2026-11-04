import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { SecurityPolicyDocument } from "./SecurityPolicy.ts";
export interface AccessPolicyProps {
    /**
     * Name of the data access policy (3-32 characters, lowercase). Changing the
     * name replaces the policy.
     * @default a generated physical name
     */
    policyName?: string;
    /**
     * The data access policy document — a JSON array of rules granting principals
     * (IAM roles/users) collection- and index-level permissions such as
     * `aoss:CreateIndex`, `aoss:ReadDocument`, `aoss:WriteDocument`. Supply an
     * array/object or a pre-serialized string.
     */
    policy: SecurityPolicyDocument;
    /**
     * A human-readable description of the policy.
     */
    description?: string;
}
export interface AccessPolicy extends Resource<"AWS.OpenSearchServerless.AccessPolicy", AccessPolicyProps, {
    /**
     * Name of the access policy.
     */
    policyName: string;
    /**
     * Policy type (`data`).
     */
    type: string;
    /**
     * Version of the policy, used for optimistic-concurrency updates.
     */
    policyVersion: string;
    /**
     * Description of the access policy.
     */
    description?: string;
}, {}, Providers> {
}
/**
 * An Amazon OpenSearch Serverless data access policy. Data access policies
 * grant IAM principals fine-grained permissions on collections and their
 * indexes (create/read/write/delete documents, create indexes, etc.) — they
 * are the data-plane authorization layer that complements the network and
 * encryption {@link SecurityPolicy | security policies}.
 *
 * A Bedrock Knowledge Base backed by an OpenSearch Serverless collection
 * requires a data access policy granting the Knowledge Base's service role
 * `aoss:APIAccessAll` on the collection and its indexes.
 *
 * ### Creating Access Policies
 * **Example:** Grant a Role Full Data Access
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const access = yield* AWS.OpenSearchServerless.AccessPolicy("Access", {
 *   policyName: "my-collection-access",
 *   policy: [
 *     {
 *       Rules: [
 *         {
 *           ResourceType: "collection",
 *           Resource: ["collection/my-collection"],
 *           Permission: ["aoss:*"],
 *         },
 *         {
 *           ResourceType: "index",
 *           Resource: ["index/my-collection/*"],
 *           Permission: ["aoss:*"],
 *         },
 *       ],
 *       Principal: ["arn:aws:iam::123456789012:role/my-role"],
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export declare const AccessPolicy: import("../../Resource.ts").ResourceClass<AccessPolicy>;
export declare const AccessPolicyProvider: () => import("effect/Layer").Layer<Provider.Provider<AccessPolicy>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=AccessPolicy.d.ts.map