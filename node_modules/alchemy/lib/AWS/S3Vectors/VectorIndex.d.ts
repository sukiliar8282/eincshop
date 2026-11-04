import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface IndexProps {
    /**
     * Name of the vector bucket that holds this index. Pass
     * `bucket.vectorBucketName` from a {@link VectorBucket}.
     *
     * Changing it replaces the index.
     */
    vectorBucketName: string;
    /**
     * Name of the index (3-63 chars, lowercase). If omitted, a unique name is
     * generated from the app, stage, and logical id.
     *
     * Changing the name replaces the index.
     * @default ${app}-${stage}-${id}
     */
    indexName?: string;
    /**
     * The data type of the vectors stored in this index. Immutable — changing
     * it replaces the index.
     * @default "float32"
     */
    dataType?: "float32";
    /**
     * The number of dimensions of the vectors stored in this index. Immutable —
     * changing it replaces the index.
     */
    dimension: number;
    /**
     * The distance metric used for similarity queries. Immutable — changing it
     * replaces the index.
     */
    distanceMetric: "euclidean" | "cosine";
    /**
     * Metadata keys that are stored but NOT filterable at query time. Immutable
     * — changing it replaces the index.
     */
    nonFilterableMetadataKeys?: string[];
    /**
     * Tags to apply to the index. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Index extends Resource<"AWS.S3Vectors.Index", IndexProps, {
    /**
     * Name of the vector bucket containing the index.
     */
    vectorBucketName: string;
    /**
     * Name of the index.
     */
    indexName: string;
    /**
     * ARN of the index.
     */
    indexArn: string;
}, never, Providers> {
}
/**
 * A vector index inside an S3 Vectors {@link VectorBucket} — stores vectors of
 * a fixed dimension and answers similarity queries under a distance metric.
 *
 * The index shape (data type, dimension, distance metric, non-filterable
 * metadata keys) is fixed at create time; changing any of them replaces the
 * index.
 *
 * ### Creating an Index
 * **Example:** Cosine-Similarity Index
 * ```typescript
 * import * as S3Vectors from "alchemy/AWS/S3Vectors";
 *
 * const bucket = yield* S3Vectors.VectorBucket("Embeddings", {});
 * const index = yield* S3Vectors.Index("Docs", {
 *   vectorBucketName: bucket.vectorBucketName,
 *   dimension: 1024,
 *   distanceMetric: "cosine",
 * });
 * ```
 *
 * @resource
 */
export declare const Index: import("../../Resource.ts").ResourceClass<Index>;
export declare const IndexProvider: () => import("effect/Layer").Layer<Provider.Provider<Index>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=VectorIndex.d.ts.map