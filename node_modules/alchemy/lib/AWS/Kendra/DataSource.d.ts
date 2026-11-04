import * as kendra from "@distilled.cloud/aws/kendra";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export type DataSourceStatus = kendra.DataSourceStatus;
export type DataSourceType = kendra.DataSourceType;
export interface DataSourceProps {
    /**
     * The identifier of the Kendra index the data source connects to.
     * Changing it replaces the data source.
     */
    indexId: string;
    /**
     * Name of the data source.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * The connector type (e.g. `S3`, `TEMPLATE`, `WEBCRAWLER`, `CUSTOM`).
     * Changing it replaces the data source.
     */
    type: DataSourceType;
    /**
     * Connector-specific configuration (e.g. `S3Configuration` or
     * `TemplateConfiguration`). Required for all types except `CUSTOM`.
     */
    configuration?: kendra.DataSourceConfiguration;
    /**
     * VPC configuration for connectors that reach into a VPC.
     */
    vpcConfiguration?: kendra.DataSourceVpcConfiguration;
    /**
     * A description of the data source.
     */
    description?: string;
    /**
     * Sync schedule as a cron expression (e.g. `cron(0 12 * * ? *)`). When
     * omitted, syncs run only on demand.
     */
    schedule?: string;
    /**
     * ARN of the IAM role Kendra assumes to access the source content.
     * Required for all types except `CUSTOM`.
     */
    roleArn?: string;
    /**
     * The code for a language the source documents are in.
     * @default "en"
     */
    languageCode?: string;
    /**
     * Alter document metadata/content during ingestion.
     */
    customDocumentEnrichmentConfiguration?: kendra.CustomDocumentEnrichmentConfiguration;
    /**
     * Tags to associate with the data source.
     */
    tags?: Record<string, string>;
}
export interface DataSource extends Resource<"AWS.Kendra.DataSource", DataSourceProps, {
    /**
     * Service-assigned unique identifier of the data source (unique within
     * its index).
     */
    id: string;
    /**
     * The identifier of the index the data source belongs to.
     */
    indexId: string;
    /**
     * ARN of the data source.
     */
    arn: string;
    /**
     * The data source's name.
     */
    name: string;
    /**
     * The connector type.
     */
    type: DataSourceType | undefined;
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
 * An Amazon Kendra data source — a connector that syncs documents from a
 * repository (S3 bucket, SharePoint, website, ...) into a Kendra index.
 *
 * ### Creating Data Sources
 * **Example:** S3 Data Source
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const source = yield* AWS.Kendra.DataSource("Docs", {
 *   indexId: index.id,
 *   type: "S3",
 *   roleArn: dataSourceRole.roleArn,
 *   configuration: {
 *     S3Configuration: {
 *       BucketName: bucket.bucketName,
 *     },
 *   },
 * });
 * ```
 *
 * **Example:** Scheduled Sync
 * ```typescript
 * const source = yield* AWS.Kendra.DataSource("Docs", {
 *   indexId: index.id,
 *   type: "S3",
 *   roleArn: dataSourceRole.roleArn,
 *   schedule: "cron(0 12 * * ? *)",
 *   configuration: {
 *     S3Configuration: { BucketName: bucket.bucketName },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const DataSource: import("../../Resource.ts").ResourceClass<DataSource>;
declare const DataSourceProvisioningFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "DataSourceProvisioningFailed";
} & Readonly<A>;
/**
 * A data source whose asynchronous provisioning converged to the terminal
 * `FAILED` status.
 */
export declare class DataSourceProvisioningFailed extends DataSourceProvisioningFailed_base<{
    readonly id: string;
    readonly message: string | undefined;
}> {
}
export declare const DataSourceProvider: () => import("effect/Layer").Layer<Provider.Provider<DataSource>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=DataSource.d.ts.map