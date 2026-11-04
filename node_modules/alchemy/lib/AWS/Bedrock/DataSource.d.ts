import * as bedrock from "@distilled.cloud/aws/bedrock-agent";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
/**
 * The connector configuration for a data source. Passed through to the
 * Bedrock API unchanged — see the AWS SDK `DataSourceConfiguration` shape.
 * The common case is a `S3` type with `s3Configuration.bucketArn` set.
 */
export type DataSourceConfiguration = bedrock.DataSourceConfiguration;
/**
 * Controls document chunking, parsing, and custom transformation before
 * embedding. Passed through unchanged — see the AWS SDK
 * `VectorIngestionConfiguration` shape.
 */
export type VectorIngestionConfiguration = bedrock.VectorIngestionConfiguration;
/**
 * What happens to the vector embeddings when the data source is deleted.
 * `DELETE` removes them; `RETAIN` leaves them in the vector store.
 */
export type DataDeletionPolicy = "RETAIN" | "DELETE";
export interface DataSourceProps {
    /**
     * The id of the {@link KnowledgeBase} this data source feeds. Accepts a
     * knowledge base's `knowledgeBaseId` output. Changing the knowledge base
     * triggers a replacement.
     */
    knowledgeBaseId: string;
    /**
     * Name of the data source (1-100 characters). If omitted, a deterministic
     * physical name is generated from the app, stage, and logical ID. Changing
     * the name triggers a replacement.
     */
    name?: string;
    /**
     * A description of the data source.
     */
    description?: string;
    /**
     * The connector configuration (S3 bucket, web crawler, Confluence, ...).
     */
    dataSourceConfiguration: DataSourceConfiguration;
    /**
     * What happens to vector embeddings when the data source is deleted.
     * @default "RETAIN"
     */
    dataDeletionPolicy?: DataDeletionPolicy;
    /**
     * Document chunking / parsing configuration applied before embedding.
     */
    vectorIngestionConfiguration?: VectorIngestionConfiguration;
}
export interface DataSource extends Resource<"AWS.Bedrock.DataSource", DataSourceProps, {
    /**
     * The unique identifier of the knowledge base the data source belongs to.
     */
    knowledgeBaseId: string;
    /**
     * The unique identifier of the data source.
     */
    dataSourceId: string;
    /**
     * Name of the data source.
     */
    name: string;
}> {
}
/**
 * A data source attached to an Amazon Bedrock {@link KnowledgeBase} — the
 * origin of the documents the knowledge base embeds and indexes.
 *
 * The most common source is an S3 bucket. After the data source is created,
 * start an ingestion job (`bedrock-agent:StartIngestionJob`) to crawl the
 * source, chunk + embed the documents, and write them to the vector store.
 * Ingestion is not part of the desired-state lifecycle — trigger it whenever
 * the underlying documents change.
 *
 * ### Creating Data Sources
 * **Example:** S3 Data Source
 * ```typescript
 * import * as Bedrock from "alchemy/AWS/Bedrock";
 *
 * const source = yield* Bedrock.DataSource("docs-bucket", {
 *   knowledgeBaseId: kb.knowledgeBaseId,
 *   dataSourceConfiguration: {
 *     type: "S3",
 *     s3Configuration: { bucketArn: bucket.bucketArn },
 *   },
 *   dataDeletionPolicy: "DELETE",
 * });
 * ```
 *
 * @resource
 */
export declare const DataSource: import("../../Resource.ts").ResourceClass<DataSource>;
export declare const DataSourceProvider: () => import("effect/Layer").Layer<Provider.Provider<DataSource>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=DataSource.d.ts.map