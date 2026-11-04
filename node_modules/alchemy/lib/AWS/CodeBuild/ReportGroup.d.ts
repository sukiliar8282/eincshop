import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
/**
 * Where CodeBuild exports the raw report data.
 */
export interface ReportGroupExportConfig {
    /**
     * `NO_EXPORT` keeps report data only in CodeBuild (30-day retention);
     * `S3` additionally exports the raw data to a bucket.
     * @default "NO_EXPORT"
     */
    exportConfigType?: "NO_EXPORT" | "S3";
    /**
     * S3 destination for exported report data (for `exportConfigType: "S3"`).
     */
    s3Destination?: {
        /** Name of the destination bucket. */
        bucket?: string;
        /** AWS account that owns the bucket, when not the report's account. */
        bucketOwner?: string;
        /** Path prefix inside the bucket. */
        path?: string;
        /**
         * Whether the exported data is zipped.
         * @default "NONE"
         */
        packaging?: "ZIP" | "NONE";
        /** KMS key used to encrypt the exported data. */
        encryptionKey?: string;
        /** Disable encryption of the exported data. */
        encryptionDisabled?: boolean;
    };
}
export interface ReportGroupProps {
    /**
     * Name of the report group (2-128 chars). Builds address it from the
     * buildspec `reports:` section as `<project-name>-<group-name>` or by this
     * exact name. If omitted a deterministic physical name is generated.
     * Changing the name replaces the report group.
     */
    reportGroupName?: string;
    /**
     * What the group's reports contain: test results or code coverage.
     * Changing the type replaces the report group.
     */
    type: "TEST" | "CODE_COVERAGE";
    /**
     * Where raw report data is exported.
     * @default { exportConfigType: "NO_EXPORT" }
     */
    exportConfig?: ReportGroupExportConfig;
    /**
     * Also delete any reports in the group when the group is destroyed.
     * @default true
     */
    deleteReports?: boolean;
    /**
     * User-defined tags.
     */
    tags?: Record<string, string>;
}
export interface ReportGroup extends Resource<"AWS.CodeBuild.ReportGroup", ReportGroupProps, {
    /** Physical name of the report group. */
    reportGroupName: string;
    /** ARN of the report group. */
    reportGroupArn: string;
}> {
}
/**
 * An AWS CodeBuild report group — a named collection of test or
 * code-coverage reports produced by builds. A build's buildspec `reports:`
 * section uploads its test results into a report group, and the report-read
 * bindings ({@link BatchGetReports}, {@link DescribeTestCases}, …) let
 * runtime code query them.
 *
 * ### Creating a Report Group
 * **Example:** Test Report Group
 * ```typescript
 * const reports = yield* CodeBuild.ReportGroup("UnitTests", {
 *   type: "TEST",
 * });
 * ```
 *
 * **Example:** Coverage Group Exported to S3
 * ```typescript
 * const coverage = yield* CodeBuild.ReportGroup("Coverage", {
 *   type: "CODE_COVERAGE",
 *   exportConfig: {
 *     exportConfigType: "S3",
 *     s3Destination: { bucket: bucket.bucketName, packaging: "ZIP" },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const ReportGroup: import("../../Resource.ts").ResourceClass<ReportGroup>;
export declare const ReportGroupProvider: () => import("effect/Layer").Layer<Provider.Provider<ReportGroup>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ReportGroup.d.ts.map