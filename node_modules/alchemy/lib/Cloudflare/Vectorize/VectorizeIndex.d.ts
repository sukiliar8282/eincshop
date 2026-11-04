import * as vectorize from "@distilled.cloud/cloudflare/vectorize";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.VectorizeIndex";
type TypeId = typeof TypeId;
export type DistanceMetric = "cosine" | "euclidean" | "dot-product";
export type Preset = "@cf/baai/bge-small-en-v1.5" | "@cf/baai/bge-base-en-v1.5" | "@cf/baai/bge-large-en-v1.5" | "openai/text-embedding-ada-002" | "cohere/embed-multilingual-v2.0" | (string & {});
export type IndexProps = {
    /**
     * Name of the index. If omitted, a unique name will be generated.
     * Must be lowercase alphanumeric with hyphens. Changing it triggers a
     * replacement.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * Number of dimensions for each vector stored in the index. Required
     * unless `preset` is provided. Cannot be changed after creation —
     * updating this property triggers a replacement.
     */
    dimensions?: number;
    /**
     * Distance metric used for similarity search. Cannot be changed after
     * creation — updating this property triggers a replacement.
     * @default "cosine"
     */
    metric?: DistanceMetric;
    /**
     * A managed embedding model preset that fixes `dimensions` and `metric`
     * to match the named model. Mutually exclusive with `dimensions`/`metric`.
     * Cannot be changed after creation — updating this triggers a replacement.
     */
    preset?: Preset;
    /**
     * Human-readable description of the index. Vectorize has no update API,
     * so changing the description triggers a replacement.
     */
    description?: string;
};
export type IndexAttributes = {
    indexName: string;
    dimensions: number | undefined;
    metric: DistanceMetric | undefined;
    description: string | undefined;
    accountId: string;
    createdOn: string | undefined;
    modifiedOn: string | undefined;
};
export type Index = Resource<TypeId, IndexProps, IndexAttributes, never, Providers>;
/**
 * A Cloudflare Vectorize index for storing and querying vector embeddings.
 *
 * Vectorize is a globally distributed vector database. Create an index as a
 * resource, then bind it to a Worker to insert, upsert, and query vectors.
 *
 * A Vectorize index is identified by its name and is immutable: its
 * dimensions, metric, preset, and description are all fixed at creation.
 * Changing any of them triggers a replacement.
 * ### Creating an Index
 * **Example:** Index with explicit dimensions and metric
 * ```typescript
 * const index = yield* Cloudflare.Vectorize.Index("my-index", {
 *   dimensions: 768,
 *   metric: "cosine",
 * });
 * ```
 *
 * **Example:** Index from a managed embedding model preset
 * A preset fixes the dimensions and metric to match the named model.
 * ```typescript
 * const index = yield* Cloudflare.Vectorize.Index("my-index", {
 *   preset: "@cf/baai/bge-base-en-v1.5",
 * });
 * ```
 *
 * **Example:** Index with a description
 * ```typescript
 * const index = yield* Cloudflare.Vectorize.Index("my-index", {
 *   dimensions: 1536,
 *   metric: "euclidean",
 *   description: "Product catalog embeddings",
 * });
 * ```
 *
 * ### Binding to a Worker
 * **Example:** Querying an index inside a Worker
 * ```typescript
 * const index = yield* Cloudflare.Vectorize.SearchIndex(MyIndex);
 *
 * // Insert vectors
 * yield* index.upsert([
 *   { id: "1", values: [0.1, 0.2, 0.3], metadata: { title: "doc" } },
 * ]);
 *
 * // Query the nearest neighbors
 * const matches = yield* index.query([0.1, 0.2, 0.3], { topK: 5 });
 * ```
 *
 * @see https://developers.cloudflare.com/vectorize/
 *
 * @resource
 * @product Vectorize
 * @category AI
 */
export declare const Index: import("../../Resource.ts").ResourceClass<Index>;
/**
 * Returns true if the given value is a Vectorize Index resource.
 */
export declare const isIndex: (value: unknown) => value is Index;
export declare const IndexProvider: () => import("effect/Layer").Layer<Provider.Provider<Index>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | vectorize.CloudflareOpContext>;
export {};
//# sourceMappingURL=VectorizeIndex.d.ts.map