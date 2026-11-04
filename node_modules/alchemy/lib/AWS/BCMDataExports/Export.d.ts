import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * The SQL query and table configurations for a data export.
 */
export interface ExportDataQuery {
    /**
     * The SQL statement selecting the columns to export, e.g.
     * `SELECT identity_line_item_id, line_item_unblended_cost FROM COST_AND_USAGE_REPORT`.
     * Data Exports supports a limited subset of SQL — see the AWS Data Exports
     * table dictionary for available tables and columns.
     */
    queryStatement: string;
    /**
     * Per-table property overrides, e.g.
     * `{ COST_AND_USAGE_REPORT: { TIME_GRANULARITY: "HOURLY" } }`.
     * Every table property has a default it assumes when omitted.
     */
    tableConfigurations?: Record<string, Record<string, string>>;
}
/**
 * Formatting options for the objects written to S3.
 */
export interface ExportS3OutputConfigurations {
    /**
     * The output type of the export.
     * @default "CUSTOM"
     */
    outputType?: "CUSTOM" | (string & {});
    /**
     * The file format of the exported objects.
     * @default "TEXT_OR_CSV"
     */
    format?: "TEXT_OR_CSV" | "PARQUET" | (string & {});
    /**
     * The compression of the exported objects. Use `PARQUET` compression with
     * the `PARQUET` format.
     * @default "GZIP"
     */
    compression?: "GZIP" | "PARQUET" | (string & {});
    /**
     * Whether each delivery overwrites the previous report or writes a new one.
     * @default "OVERWRITE_REPORT"
     */
    overwrite?: "CREATE_NEW_REPORT" | "OVERWRITE_REPORT" | (string & {});
}
/**
 * The S3 bucket the export is delivered to. The bucket policy must allow the
 * `bcm-data-exports.amazonaws.com` and `billingreports.amazonaws.com` service
 * principals to `s3:PutObject` and `s3:GetBucketPolicy`.
 */
export interface ExportS3Destination {
    /**
     * Name of the destination S3 bucket.
     */
    s3Bucket: string;
    /**
     * Key prefix the export is written under.
     */
    s3Prefix: string;
    /**
     * Region of the destination S3 bucket.
     */
    s3Region: string;
    /**
     * Account ID that owns the destination bucket, for cross-account delivery.
     */
    s3BucketOwner?: string;
    /**
     * Output formatting options.
     * @default `{ outputType: "CUSTOM", format: "TEXT_OR_CSV", compression: "GZIP", overwrite: "OVERWRITE_REPORT" }`
     */
    s3OutputConfigurations?: ExportS3OutputConfigurations;
}
export interface ExportProps {
    /**
     * Name of the export. Must be unique within the account. If omitted, a
     * unique name is generated from the app, stage, and logical ID.
     *
     * Changing the name replaces the export.
     */
    exportName?: string;
    /**
     * Description of the export.
     */
    description?: string;
    /**
     * The SQL data query — the statement plus optional table configurations.
     */
    dataQuery: ExportDataQuery;
    /**
     * The S3 destination the export is delivered to.
     */
    s3Destination: ExportS3Destination;
    /**
     * How often the export refreshes. `SYNCHRONOUS` refreshes whenever the
     * source billing data updates.
     * @default `{ frequency: "SYNCHRONOUS" }`
     */
    refreshCadence?: {
        /**
         * The refresh frequency.
         * @default "SYNCHRONOUS"
         */
        frequency: "SYNCHRONOUS" | (string & {});
    };
    /**
     * Tags applied to the export.
     */
    tags?: Record<string, string>;
}
export interface Export extends Resource<"AWS.BCMDataExports.Export", ExportProps, {
    /**
     * Name of the export.
     */
    exportName: string;
    /**
     * The ARN of the export.
     */
    exportArn: string;
}, never, Providers> {
}
/**
 * An AWS Billing and Cost Management data export (Data Exports / CUR 2.0) —
 * delivers billing and cost management data selected by an SQL query to an
 * S3 bucket on a refresh cadence.
 *
 * Data Exports is a global service pinned to `us-east-1`; exports are free
 * (standard S3 storage rates apply to the delivered objects).
 *
 * The destination bucket must grant the Data Exports service principals
 * write access via its bucket policy (see the example below).
 *
 * ### Creating an Export
 * **Example:** CUR 2.0 export to an S3 bucket
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const bucket = yield* AWS.S3.Bucket("BillingData", {
 *   forceDestroy: true,
 *   policy: [
 *     {
 *       Effect: "Allow",
 *       Principal: {
 *         Service: [
 *           "billingreports.amazonaws.com",
 *           "bcm-data-exports.amazonaws.com",
 *         ],
 *       },
 *       Action: ["s3:PutObject", "s3:GetBucketPolicy"],
 *       Resource: [bucket.bucketArn, AWS.interpolate`${bucket.bucketArn}/*`],
 *     },
 *   ],
 * });
 *
 * const cur = yield* AWS.BCMDataExports.Export("Cur2", {
 *   dataQuery: {
 *     queryStatement:
 *       "SELECT identity_line_item_id, line_item_unblended_cost FROM COST_AND_USAGE_REPORT",
 *     tableConfigurations: {
 *       COST_AND_USAGE_REPORT: { TIME_GRANULARITY: "HOURLY" },
 *     },
 *   },
 *   s3Destination: {
 *     s3Bucket: bucket.bucketName,
 *     s3Prefix: "cur2",
 *     s3Region: "us-west-2",
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Export: import("../../Resource.ts").ResourceClass<Export>;
export declare const ExportProvider: () => import("effect/Layer").Layer<Provider.Provider<Export>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Export.d.ts.map