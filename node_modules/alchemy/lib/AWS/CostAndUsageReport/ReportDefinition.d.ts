import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export interface ReportDefinitionProps {
    /**
     * Name of the report (also the prefix of the report files in S3). Must be
     * unique in the account; up to 256 characters of `A-Za-z0-9!\-_.*'()`.
     * If omitted, a unique name is generated from the app, stage, and logical
     * ID.
     *
     * Changing the name replaces the report definition.
     */
    reportName?: string;
    /**
     * The granularity of line items in the report.
     */
    timeUnit: "HOURLY" | "DAILY" | "MONTHLY" | (string & {});
    /**
     * The format the report files are generated in.
     */
    format: "textORcsv" | "Parquet" | (string & {});
    /**
     * The compression applied to the report files. Must be `Parquet` when
     * `format` is `Parquet`.
     */
    compression: "ZIP" | "GZIP" | "Parquet" | (string & {});
    /**
     * Additional detail included in the report, e.g. `["RESOURCES"]` to include
     * individual resource IDs.
     * @default []
     */
    additionalSchemaElements?: ("RESOURCES" | "SPLIT_COST_ALLOCATION_DATA" | "MANUAL_DISCOUNT_COMPATIBILITY" | (string & {}))[];
    /**
     * Name of the S3 bucket the report is delivered to. The bucket policy must
     * allow `billingreports.amazonaws.com` to call `s3:GetBucketAcl`,
     * `s3:GetBucketPolicy`, and `s3:PutObject`.
     */
    s3Bucket: string;
    /**
     * S3 key prefix the report files are delivered under.
     */
    s3Prefix: string;
    /**
     * The region the delivery bucket lives in, e.g. `us-east-1`.
     */
    s3Region: string;
    /**
     * Artifacts AWS additionally prepares the report for (`REDSHIFT`,
     * `QUICKSIGHT`, or `ATHENA`). `ATHENA` requires Parquet format/compression
     * and `OVERWRITE_REPORT` versioning, and cannot be combined with the other
     * artifacts.
     */
    additionalArtifacts?: ("REDSHIFT" | "QUICKSIGHT" | "ATHENA" | (string & {}))[];
    /**
     * Whether AWS updates previously delivered reports when charges are applied
     * retroactively (refunds, credits, RI fees).
     * @default true
     */
    refreshClosedReports?: boolean;
    /**
     * Whether each report update overwrites the previous version
     * (`OVERWRITE_REPORT`) or is delivered alongside it (`CREATE_NEW_REPORT`).
     * @default "CREATE_NEW_REPORT"
     */
    reportVersioning?: "CREATE_NEW_REPORT" | "OVERWRITE_REPORT" | (string & {});
    /**
     * ARN of the billing view the report is scoped to. Omit for the account's
     * primary billing view.
     *
     * Changing the billing view replaces the report definition.
     */
    billingViewArn?: string;
    /**
     * Tags to apply to the report definition.
     */
    tags?: Record<string, string>;
}
export interface ReportDefinition extends Resource<"AWS.CostAndUsageReport.ReportDefinition", ReportDefinitionProps, {
    /** Name of the report definition. */
    reportName: string;
    /** ARN of the report definition. */
    reportArn: string;
    /** Granularity of the report (`HOURLY`, `DAILY`, `MONTHLY`). */
    timeUnit: string;
    /** File format of the report (`textORcsv` or `Parquet`). */
    format: string;
    /** Compression applied to report files (`ZIP`, `GZIP`, `Parquet`). */
    compression: string;
    /** Name of the S3 bucket the report is delivered to. */
    s3Bucket: string;
    /** S3 key prefix the report is delivered under. */
    s3Prefix: string;
    /** Region of the delivery S3 bucket. */
    s3Region: string;
}, never, Providers> {
}
/**
 * An AWS Cost and Usage Report (CUR) definition — the most granular billing
 * data AWS offers, delivered as CSV or Parquet files to an S3 bucket you own.
 *
 * The CUR API is a global service hosted only in `us-east-1`; this resource
 * pins every control-plane call there regardless of the stack region. The
 * delivery bucket may live in any region (declared via `s3Region`) but its
 * bucket policy must grant `billingreports.amazonaws.com` the
 * `s3:GetBucketAcl`, `s3:GetBucketPolicy`, and `s3:PutObject` permissions —
 * report creation fails validation otherwise.
 *
 * Report definitions are free; you pay only for the S3 storage of delivered
 * reports.
 *
 * ### Creating a Report
 * **Example:** Daily CSV report with resource IDs
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const bucket = yield* AWS.S3.Bucket("ReportBucket", {
 *   bucketName: "my-cur-reports",
 *   policy: [
 *     {
 *       Effect: "Allow",
 *       Principal: { Service: "billingreports.amazonaws.com" },
 *       Action: ["s3:GetBucketAcl", "s3:GetBucketPolicy"],
 *       Resource: "arn:aws:s3:::my-cur-reports",
 *     },
 *     {
 *       Effect: "Allow",
 *       Principal: { Service: "billingreports.amazonaws.com" },
 *       Action: ["s3:PutObject"],
 *       Resource: "arn:aws:s3:::my-cur-reports/*",
 *     },
 *   ],
 * });
 *
 * const report = yield* AWS.CostAndUsageReport.ReportDefinition("Costs", {
 *   timeUnit: "DAILY",
 *   format: "textORcsv",
 *   compression: "GZIP",
 *   additionalSchemaElements: ["RESOURCES"],
 *   s3Bucket: bucket.bucketName,
 *   s3Prefix: "cur",
 *   s3Region: bucket.region,
 * });
 * ```
 *
 * **Example:** Athena-ready Parquet report
 * ```typescript
 * const report = yield* AWS.CostAndUsageReport.ReportDefinition("Athena", {
 *   timeUnit: "HOURLY",
 *   format: "Parquet",
 *   compression: "Parquet",
 *   additionalArtifacts: ["ATHENA"],
 *   reportVersioning: "OVERWRITE_REPORT",
 *   s3Bucket: bucket.bucketName,
 *   s3Prefix: "athena-cur",
 *   s3Region: bucket.region,
 * });
 * ```
 *
 * @resource
 */
export declare const ReportDefinition: import("../../Resource.ts").ResourceClass<ReportDefinition>;
export declare const ReportDefinitionProvider: () => import("effect/Layer").Layer<Provider.Provider<ReportDefinition>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ReportDefinition.d.ts.map