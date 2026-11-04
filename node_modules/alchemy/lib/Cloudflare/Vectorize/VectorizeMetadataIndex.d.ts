import * as vectorize from "@distilled.cloud/cloudflare/vectorize";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
export type MetadataIndexType = "string" | "number" | "boolean";
export type MetadataIndexProps = {
    /**
     * Name of the parent Vectorize index. Pass `index.indexName` from a
     * `VectorizeIndex` to track the dependency. Changing the parent index
     * triggers a replacement.
     */
    indexName: string;
    /**
     * The metadata property to index. Filter expressions in `query` use this
     * name (e.g. `{ category: { $eq: "books" } }`). Cannot be changed after
     * creation — updating triggers a replacement.
     */
    propertyName: string;
    /**
     * The type of metadata values stored under `propertyName`. Cannot be
     * changed after creation — updating triggers a replacement.
     */
    indexType: MetadataIndexType;
};
export type MetadataIndexAttributes = {
    propertyName: string;
    indexType: MetadataIndexType;
    indexName: string;
    accountId: string;
    mutationId: string | undefined;
};
export type MetadataIndex = Resource<"Cloudflare.VectorizeMetadataIndex", MetadataIndexProps, MetadataIndexAttributes, never, Providers>;
/**
 * A metadata index on a Cloudflare Vectorize index.
 *
 * Metadata indexes enable filtering query results by metadata properties.
 * Without a metadata index on a property, that property cannot be used in
 * the `filter` of a `query()` call.
 *
 * A metadata index is identified by its parent index and `propertyName` and
 * is immutable — changing the property name, type, or parent index triggers
 * a replacement.
 * ### Creating a Metadata Index
 * **Example:** Index a string metadata property
 * ```typescript
 * const index = yield* Cloudflare.Vectorize.Index("my-index", {
 *   dimensions: 768,
 *   metric: "cosine",
 * });
 *
 * yield* Cloudflare.Vectorize.MetadataIndex("CategoryMetaIndex", {
 *   indexName: index.indexName,
 *   propertyName: "category",
 *   indexType: "string",
 * });
 * ```
 *
 * **Example:** Index a numeric metadata property
 * ```typescript
 * yield* Cloudflare.Vectorize.MetadataIndex("PriceMetaIndex", {
 *   indexName: index.indexName,
 *   propertyName: "price",
 *   indexType: "number",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/vectorize/reference/metadata-filtering/
 *
 * @resource
 * @product Vectorize
 * @category AI
 */
export declare const MetadataIndex: import("../../Resource.ts").ResourceClass<MetadataIndex>;
export declare const MetadataIndexProvider: () => import("effect/Layer").Layer<Provider.Provider<MetadataIndex>, never, CloudflareEnvironment | vectorize.CloudflareOpContext>;
//# sourceMappingURL=VectorizeMetadataIndex.d.ts.map