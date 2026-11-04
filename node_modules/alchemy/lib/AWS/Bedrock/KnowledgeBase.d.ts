import * as bedrock from "@distilled.cloud/aws/bedrock-agent";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
/**
 * The vector-store and embedding configuration of a knowledge base. Passed
 * through to the Bedrock API unchanged — see the AWS SDK
 * `KnowledgeBaseConfiguration` shape. The common case is a `VECTOR` type with
 * `vectorKnowledgeBaseConfiguration.embeddingModelArn` set.
 */
export type KnowledgeBaseConfiguration = bedrock.KnowledgeBaseConfiguration;
/**
 * The backing vector store (OpenSearch Serverless, Pinecone, RDS/pgvector,
 * S3 Vectors, ...). Passed through to the Bedrock API unchanged — see the AWS
 * SDK `StorageConfiguration` shape. Omit for a managed vector store.
 */
export type StorageConfiguration = bedrock.StorageConfiguration;
export interface KnowledgeBaseProps {
    /**
     * Name of the knowledge base (1-100 characters). If omitted, a
     * deterministic physical name is generated from the app, stage, and
     * logical ID. Changing the name triggers a replacement.
     */
    name?: string;
    /**
     * A description of the knowledge base.
     */
    description?: string;
    /**
     * The ARN of an IAM role Bedrock assumes to access the embedding model,
     * the vector store, and (via data sources) the source data. Must trust
     * `bedrock.amazonaws.com`.
     */
    roleArn: string;
    /**
     * The embedding + vector-store type configuration. Changing the type
     * triggers a replacement.
     */
    knowledgeBaseConfiguration: KnowledgeBaseConfiguration;
    /**
     * The backing vector store. Omit for a Bedrock-managed store.
     */
    storageConfiguration?: StorageConfiguration;
    /**
     * Tags to apply to the knowledge base. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface KnowledgeBase extends Resource<"AWS.Bedrock.KnowledgeBase", KnowledgeBaseProps, {
    /**
     * The unique identifier of the knowledge base.
     */
    knowledgeBaseId: string;
    /**
     * The ARN of the knowledge base.
     */
    knowledgeBaseArn: string;
    /**
     * Name of the knowledge base.
     */
    name: string;
    /**
     * The ARN of the execution role the knowledge base assumes to access the
     * embedding model and vector store.
     */
    roleArn: string;
}> {
}
/**
 * An Amazon Bedrock knowledge base — a managed RAG index that embeds source
 * documents into a vector store for retrieval.
 *
 * `KnowledgeBase` owns the index configuration; attach one or more
 * {@link DataSource}s (e.g. an S3 bucket) to feed it documents, then trigger
 * ingestion. Query it at runtime with the {@link Retrieve} and
 * {@link RetrieveAndGenerate} bindings, or attach it to an {@link Agent}.
 *
 * The `roleArn` must grant Bedrock access to the embedding model, the vector
 * store, and the source data. The vector store (`storageConfiguration`) must
 * already exist — provision an OpenSearch Serverless collection (with a
 * vector index) or another supported store first.
 *
 * ### Creating Knowledge Bases
 * **Example:** OpenSearch Serverless Backed Knowledge Base
 * ```typescript
 * import * as Bedrock from "alchemy/AWS/Bedrock";
 *
 * const kb = yield* Bedrock.KnowledgeBase("docs", {
 *   roleArn: role.roleArn,
 *   knowledgeBaseConfiguration: {
 *     type: "VECTOR",
 *     vectorKnowledgeBaseConfiguration: {
 *       embeddingModelArn:
 *         "arn:aws:bedrock:us-west-2::foundation-model/amazon.titan-embed-text-v2:0",
 *     },
 *   },
 *   storageConfiguration: {
 *     type: "OPENSEARCH_SERVERLESS",
 *     opensearchServerlessConfiguration: {
 *       collectionArn: collection.arn,
 *       vectorIndexName: "bedrock-index",
 *       fieldMapping: {
 *         vectorField: "bedrock-vector",
 *         textField: "bedrock-text",
 *         metadataField: "bedrock-metadata",
 *       },
 *     },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const KnowledgeBase: import("../../Resource.ts").ResourceClass<KnowledgeBase>;
export declare const KnowledgeBaseProvider: () => import("effect/Layer").Layer<Provider.Provider<KnowledgeBase>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=KnowledgeBase.d.ts.map