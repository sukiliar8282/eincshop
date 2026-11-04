import * as qbusiness from "@distilled.cloud/aws/qbusiness";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export type DataSourceStatus = qbusiness.DataSourceStatus;
export interface DataSourceProps {
    /**
     * The identifier of the Amazon Q Business application the data source
     * attaches to. Changing it replaces the data source.
     */
    applicationId: string;
    /**
     * The identifier of the index the data source syncs documents into.
     * Changing it replaces the data source.
     */
    indexId: string;
    /**
     * Display name of the data source.
     * @default ${app}-${stage}-${id}
     */
    displayName?: string;
    /**
     * Connector-specific configuration (e.g. the S3 or Web Crawler connector
     * template). See the Amazon Q Business connector documentation for each
     * connector's schema.
     */
    configuration: unknown;
    /**
     * VPC configuration for connectors that reach into a VPC.
     */
    vpcConfiguration?: qbusiness.DataSourceVpcConfiguration;
    /**
     * A description of the data source.
     */
    description?: string;
    /**
     * Sync schedule as a cron expression (e.g. `cron(0 12 * * ? *)`). When
     * omitted, syncs run only on demand.
     */
    syncSchedule?: string;
    /**
     * ARN of the IAM role the connector assumes to access the source
     * content.
     */
    roleArn?: string;
    /**
     * Alter document metadata/content during ingestion.
     */
    documentEnrichmentConfiguration?: qbusiness.DocumentEnrichmentConfiguration;
    /**
     * Image/audio/video extraction settings for ingested media.
     */
    mediaExtractionConfiguration?: qbusiness.MediaExtractionConfiguration;
    /**
     * Tags to associate with the data source.
     */
    tags?: Record<string, string>;
}
export interface DataSource extends Resource<"AWS.QBusiness.DataSource", DataSourceProps, {
    /**
     * Service-assigned unique identifier of the data source (unique within
     * its index).
     */
    dataSourceId: string;
    /**
     * The identifier of the application the data source belongs to.
     */
    applicationId: string;
    /**
     * The identifier of the index the data source syncs into.
     */
    indexId: string;
    /**
     * ARN of the data source.
     */
    dataSourceArn: string;
    /**
     * The data source's display name.
     */
    displayName: string;
    /**
     * The connector type (e.g. `S3`, `WEBCRAWLERV2`, `CUSTOM`).
     */
    type: string | undefined;
    /**
     * Current lifecycle status of the data source.
     */
    status: DataSourceStatus | undefined;
    /**
     * Current tags reported for the data source.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon Q Business data source — a connector that syncs documents from
 * a repository (S3 bucket, website, SharePoint, ...) into an index.
 *
 * ### Creating Data Sources
 * **Example:** S3 Data Source
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const source = yield* AWS.QBusiness.DataSource("Docs", {
 *   applicationId: app.applicationId,
 *   indexId: index.indexId,
 *   roleArn: dataSourceRole.roleArn,
 *   configuration: {
 *     type: "S3",
 *     syncMode: "FORCED_FULL_CRAWL",
 *     connectionConfiguration: {
 *       repositoryEndpointMetadata: { BucketName: bucket.bucketName },
 *     },
 *     repositoryConfigurations: {
 *       document: {
 *         fieldMappings: [{
 *           indexFieldName: "s3_document_id",
 *           indexFieldType: "STRING",
 *           dataSourceFieldName: "s3_document_id",
 *         }],
 *       },
 *     },
 *   },
 * });
 * ```
 *
 * **Example:** Scheduled Sync
 * ```typescript
 * const source = yield* AWS.QBusiness.DataSource("Docs", {
 *   applicationId: app.applicationId,
 *   indexId: index.indexId,
 *   roleArn: dataSourceRole.roleArn,
 *   syncSchedule: "cron(0 12 * * ? *)",
 *   configuration: { ... },
 * });
 * ```
 *
 * @resource
 */
export declare const DataSource: import("../../Resource.ts").ResourceClass<DataSource>;
declare const DataSourceProvisioningFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "QBusinessDataSourceProvisioningFailed";
} & Readonly<A>;
/**
 * A data source whose asynchronous provisioning converged to the terminal
 * `FAILED` status.
 */
export declare class DataSourceProvisioningFailed extends DataSourceProvisioningFailed_base<{
    readonly dataSourceId: string;
    readonly message: string | undefined;
}> {
}
export declare const DataSourceProvider: () => import("effect/Layer").Layer<Provider.Provider<DataSource>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=DataSource.d.ts.map