import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface GraphProps {
    /**
     * Name of the graph (lowercase letters, numbers, and hyphens; must start
     * with a letter). If omitted, a deterministic name is generated.
     * Changing it forces replacement.
     */
    graphName?: string;
    /**
     * Provisioned memory-optimized Neptune Capacity Units (m-NCUs) for the
     * graph, e.g. `16`, `32`, `64`. In-place modify.
     */
    provisionedMemory: number;
    /**
     * Whether the graph endpoint is reachable from the public internet
     * (requests are still IAM-authenticated). In-place modify.
     * @default false
     */
    publicConnectivity?: boolean;
    /**
     * Number of replicas in other AZs. Replicas incur additional cost.
     * Immutable — forces replacement.
     * @default 1
     */
    replicaCount?: number;
    /**
     * KMS key used to encrypt data in the graph. Immutable — forces
     * replacement.
     */
    kmsKeyIdentifier?: string;
    /**
     * Vector-search configuration (dimension of vectors, 1-65535). Immutable —
     * forces replacement.
     */
    vectorSearchConfiguration?: {
        /**
         * Number of dimensions per vector.
         */
        dimension: number;
    };
    /**
     * Block accidental deletion. In-place modify.
     * @default true
     */
    deletionProtection?: boolean;
    /**
     * User-defined tags.
     */
    tags?: Record<string, string>;
}
export interface Graph extends Resource<"AWS.NeptuneGraph.Graph", GraphProps, {
    /** Server-assigned unique id of the graph (e.g. `g-abc123`). */
    graphId: string;
    /** Name of the graph. */
    graphName: string;
    /** ARN of the graph. */
    graphArn: string;
    /** HTTPS query endpoint of the graph. */
    endpoint: string | undefined;
    /** Current lifecycle status (e.g. `CREATING`, `AVAILABLE`). */
    status: string | undefined;
    /** Provisioned memory in m-NCUs. */
    provisionedMemory: number | undefined;
    /** Whether the endpoint is reachable from the public internet. */
    publicConnectivity: boolean | undefined;
    /** Number of read replicas. */
    replicaCount: number | undefined;
    /** KMS key encrypting the graph, if customer-managed. */
    kmsKeyIdentifier: string | undefined;
    /** Vector search embedding dimension, if enabled. */
    vectorSearchDimension: number | undefined;
    /** Whether deletion protection is enabled. */
    deletionProtection: boolean | undefined;
    /** Creation time of the graph (ISO 8601). */
    createTime: string | undefined;
    /** Tags on the graph (user + internal Alchemy tags). */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon Neptune Analytics graph — a serverless, memory-optimized graph
 * that serves openCypher queries over an IAM-authenticated HTTPS endpoint.
 * Unlike classic Neptune, a graph with `publicConnectivity: true` needs no
 * VPC plumbing at all. Provisioning takes several minutes and the graph
 * bills per m-NCU-hour while it exists.
 *
 * Mutable fields (`provisionedMemory`, `publicConnectivity`,
 * `deletionProtection`) are reconciled in place; immutable fields
 * (`replicaCount`, `kmsKeyIdentifier`, `vectorSearchConfiguration`) force a
 * replacement.
 * ### Creating a Graph
 * **Example:** Publicly reachable analytics graph
 * ```typescript
 * const graph = yield* Graph("Knowledge", {
 *   provisionedMemory: 16,
 *   publicConnectivity: true,
 *   replicaCount: 0,
 *   deletionProtection: false,
 * });
 * ```
 *
 * ### Vector Search
 * **Example:** Graph with vector search enabled
 * ```typescript
 * const graph = yield* Graph("Embeddings", {
 *   provisionedMemory: 16,
 *   vectorSearchConfiguration: { dimension: 1536 },
 * });
 * ```
 *
 * ### Querying
 * **Example:** Query from a Lambda function via the ExecuteQuery binding
 * ```typescript
 * const executeQuery = yield* AWS.NeptuneGraph.ExecuteQuery(graph);
 * const result = yield* executeQuery({
 *   queryString: "MATCH (n) RETURN count(n) AS n",
 *   language: "OPEN_CYPHER",
 * });
 * ```
 *
 * @resource
 */
export declare const Graph: import("../../Resource.ts").ResourceClass<Graph>;
declare const GraphProvisioningFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "GraphProvisioningFailed";
} & Readonly<A>;
/**
 * The graph entered the terminal `FAILED` state during provisioning or a
 * modification. Not retried.
 */
export declare class GraphProvisioningFailed extends GraphProvisioningFailed_base<{
    readonly graphId: string;
    readonly reason: string;
}> {
}
export declare const GraphProvider: () => import("effect/Layer").Layer<Provider.Provider<Graph>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=Graph.d.ts.map