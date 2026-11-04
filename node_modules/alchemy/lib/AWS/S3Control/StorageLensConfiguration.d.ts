import * as s3control from "@distilled.cloud/aws/s3-control";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export interface StorageLensConfigurationProps {
    /**
     * ID of the Storage Lens configuration (1-64 characters: letters,
     * numbers, `-`, `_` and `.`). If omitted, a unique ID is generated
     * from the app, stage and logical ID.
     *
     * Changing the ID replaces the configuration.
     * @default ${app}-${stage}-${id}
     */
    configId?: string;
    /**
     * Whether the S3 Storage Lens configuration is enabled (actively
     * aggregating metrics).
     * @default true
     */
    isEnabled?: boolean;
    /**
     * Account-level metrics configuration (activity metrics, advanced
     * metrics, prefix-level metrics, ...). Passed through to the S3 Control
     * API verbatim.
     * @default { BucketLevel: {} } — free metrics for every bucket
     */
    accountLevel?: s3control.AccountLevel;
    /**
     * Restrict the dashboard to specific buckets and/or regions. Mutually
     * exclusive with `exclude`.
     */
    include?: s3control.Include;
    /**
     * Exclude specific buckets and/or regions from the dashboard. Mutually
     * exclusive with `include`.
     */
    exclude?: s3control.Exclude;
    /**
     * Export the daily metrics to an S3 bucket and/or publish them to
     * CloudWatch.
     */
    dataExport?: s3control.StorageLensDataExport;
    /**
     * ARN of the AWS Organization to aggregate metrics across member
     * accounts (requires trusted access / delegated administration).
     */
    awsOrg?: string;
    /**
     * Tags to apply to the configuration. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface StorageLensConfiguration extends Resource<"AWS.S3Control.StorageLensConfiguration", StorageLensConfigurationProps, {
    /**
     * ID of the Storage Lens configuration.
     */
    configId: string;
    /**
     * ARN of the Storage Lens configuration.
     */
    storageLensArn: string;
}, never, Providers> {
}
/**
 * An Amazon S3 Storage Lens configuration — an account-wide (or
 * organization-wide) storage analytics dashboard aggregating usage and
 * activity metrics across buckets, with optional daily export to S3 or
 * CloudWatch.
 * ### Creating Dashboards
 * **Example:** Free-metrics dashboard over the whole account
 * ```typescript
 * import * as S3Control from "alchemy/AWS/S3Control";
 *
 * const lens = yield* S3Control.StorageLensConfiguration("account-lens", {});
 * ```
 *
 * **Example:** Dashboard scoped to specific buckets
 * ```typescript
 * const lens = yield* S3Control.StorageLensConfiguration("data-lens", {
 *   include: {
 *     Buckets: [bucket.bucketArn],
 *   },
 * });
 * ```
 *
 * **Example:** Advanced metrics with S3 export
 * ```typescript
 * const lens = yield* S3Control.StorageLensConfiguration("advanced-lens", {
 *   accountLevel: {
 *     ActivityMetrics: { IsEnabled: true },
 *     BucketLevel: {
 *       ActivityMetrics: { IsEnabled: true },
 *     },
 *   },
 *   dataExport: {
 *     S3BucketDestination: {
 *       Format: "CSV",
 *       OutputSchemaVersion: "V_1",
 *       AccountId: accountId,
 *       Arn: reportBucket.bucketArn,
 *     },
 *   },
 * });
 * ```
 *
 * **Example:** Disable a dashboard without deleting it
 * ```typescript
 * const lens = yield* S3Control.StorageLensConfiguration("account-lens", {
 *   isEnabled: false,
 * });
 * ```
 *
 * @resource
 */
export declare const StorageLensConfiguration: import("../../Resource.ts").ResourceClass<StorageLensConfiguration>;
export declare const StorageLensConfigurationProvider: () => import("effect/Layer").Layer<Provider.Provider<StorageLensConfiguration>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=StorageLensConfiguration.d.ts.map