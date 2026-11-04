import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * The collection type, which determines the OpenSearch features available:
 * - `SEARCH` — full-text search and analytics.
 * - `TIMESERIES` — log analytics over time-ordered data.
 * - `VECTORSEARCH` — vector (k-NN) similarity search — the type required to
 *   back an Amazon Bedrock Knowledge Base.
 */
export type CollectionType = "SEARCH" | "TIMESERIES" | "VECTORSEARCH";
export interface CollectionProps {
    /**
     * Name of the collection (3-32 characters, lowercase; must start with a
     * lowercase letter). Must be matched by an encryption
     * {@link SecurityPolicy | security policy} before it can be created. Changing
     * the name replaces the collection.
     * @default a generated physical name
     */
    collectionName?: string;
    /**
     * The collection type. Changing the type replaces the collection.
     * @default "SEARCH"
     */
    type?: CollectionType;
    /**
     * A human-readable description of the collection.
     */
    description?: string;
    /**
     * Whether to deploy redundant standby replicas (`ENABLED` doubles the OCU
     * floor but provides higher availability). Set at creation time.
     * @default "ENABLED"
     */
    standbyReplicas?: "ENABLED" | "DISABLED";
    /**
     * Whether deletion protection is enabled. When `ENABLED`, the collection
     * cannot be deleted until protection is turned off.
     * @default "DISABLED"
     */
    deletionProtection?: "ENABLED" | "DISABLED";
    /**
     * Tags to apply to the collection. Merged with the internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Collection extends Resource<"AWS.OpenSearchServerless.Collection", CollectionProps, {
    /**
     * Unique identifier of the collection.
     */
    collectionId: string;
    /**
     * Name of the collection.
     */
    collectionName: string;
    /**
     * ARN of the collection.
     */
    collectionArn: string;
    /**
     * Collection type (`SEARCH`, `TIMESERIES`, or `VECTORSEARCH`).
     */
    type?: string;
    /**
     * Collection status (e.g. `ACTIVE`, `CREATING`, `DELETING`).
     */
    status?: string;
    /**
     * ARN of the KMS key encrypting the collection.
     */
    kmsKeyArn?: string;
    /**
     * OpenSearch endpoint for data-plane requests.
     */
    collectionEndpoint?: string;
    /**
     * OpenSearch Dashboards endpoint for the collection.
     */
    dashboardEndpoint?: string;
}, {}, Providers> {
}
/**
 * An Amazon OpenSearch Serverless collection — a group of OpenSearch indexes
 * that scales OpenSearch Compute Units (OCUs) automatically. A collection of
 * type `VECTORSEARCH` is the vector store required to back an Amazon Bedrock
 * Knowledge Base.
 *
 * A collection requires a matching encryption {@link SecurityPolicy} to exist
 * before creation, plus a network security policy and a data
 * {@link AccessPolicy} to be reachable and usable. Creation is asynchronous —
 * the provider polls (bounded, ~5 minutes) until the collection reaches
 * `ACTIVE`.
 *
 * ### Creating Collections
 * **Example:** Vector Search Collection for a Bedrock Knowledge Base
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const encryption = yield* AWS.OpenSearchServerless.SecurityPolicy("Enc", {
 *   policyName: "kb-enc",
 *   type: "encryption",
 *   policy: {
 *     Rules: [{ ResourceType: "collection", Resource: ["collection/kb"] }],
 *     AWSOwnedKey: true,
 *   },
 * });
 * const network = yield* AWS.OpenSearchServerless.SecurityPolicy("Net", {
 *   policyName: "kb-net",
 *   type: "network",
 *   policy: [
 *     {
 *       Rules: [
 *         { ResourceType: "collection", Resource: ["collection/kb"] },
 *         { ResourceType: "dashboard", Resource: ["collection/kb"] },
 *       ],
 *       AllowFromPublic: true,
 *     },
 *   ],
 * });
 * const collection = yield* AWS.OpenSearchServerless.Collection("KB", {
 *   collectionName: "kb",
 *   type: "VECTORSEARCH",
 * });
 * // collection.collectionEndpoint is the aoss data-plane endpoint
 * ```
 *
 * ### Search Collections
 * **Example:** Simple Search Collection
 * ```typescript
 * const collection = yield* AWS.OpenSearchServerless.Collection("Search", {
 *   collectionName: "logs",
 *   type: "SEARCH",
 *   description: "application logs",
 * });
 * ```
 *
 * @resource
 */
export declare const Collection: import("../../Resource.ts").ResourceClass<Collection>;
export declare const CollectionProvider: () => import("effect/Layer").Layer<Provider.Provider<Collection>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Collection.d.ts.map