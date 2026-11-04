import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment, type AccountID } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
export type WorkGroupName = string;
export type WorkGroupArn = `arn:aws:athena:${RegionID}:${AccountID}:workgroup/${WorkGroupName}`;
export interface WorkGroupProps {
    /**
     * Name of the workgroup. If omitted, a unique name is generated.
     * Changing this replaces the workgroup. Up to 128 characters.
     */
    workGroupName?: string;
    /**
     * Human-readable description of the workgroup.
     */
    description?: string;
    /**
     * S3 URI (`s3://bucket/prefix/`) where query results are written.
     * Applied as the workgroup's `ResultConfiguration.OutputLocation`.
     */
    outputLocation?: string;
    /**
     * Server-side encryption for query results written to S3.
     */
    encryptionOption?: "SSE_S3" | "SSE_KMS" | "CSE_KMS";
    /**
     * KMS key ARN/ID — required when `encryptionOption` is `SSE_KMS` or `CSE_KMS`.
     */
    kmsKey?: string;
    /**
     * Force queries to use this workgroup's result configuration (output
     * location, encryption) instead of client-side settings.
     * @default true
     */
    enforceWorkGroupConfiguration?: boolean;
    /**
     * Per-query data-scanned cutoff in bytes. Queries scanning more are
     * cancelled. Minimum is 10 MB (10_000_000).
     */
    bytesScannedCutoffPerQuery?: number;
    /**
     * Publish per-query CloudWatch metrics for this workgroup.
     * @default false
     */
    publishCloudWatchMetricsEnabled?: boolean;
    /**
     * Charge S3 data-transfer/request costs to the query requester.
     * @default false
     */
    requesterPaysEnabled?: boolean;
    /**
     * Selected Athena engine version (e.g. `"Athena engine version 3"`).
     * If omitted, Athena picks the account default (AUTO).
     */
    engineVersion?: string;
    /**
     * Whether the workgroup accepts queries.
     * @default "ENABLED"
     */
    state?: "ENABLED" | "DISABLED";
    /**
     * User-defined tags to apply to the workgroup.
     */
    tags?: Record<string, string>;
}
export interface WorkGroup extends Resource<"AWS.Athena.WorkGroup", WorkGroupProps, {
    /**
     * Name of the workgroup.
     */
    workGroupName: WorkGroupName;
    /**
     * ARN of the workgroup.
     */
    workGroupArn: WorkGroupArn;
    /**
     * Whether the workgroup accepts queries.
     */
    state: "ENABLED" | "DISABLED";
    /**
     * S3 location query results are written to (`s3://bucket/prefix/`).
     */
    outputLocation: string | undefined;
    /**
     * Tags on the workgroup.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon Athena workgroup — an isolation boundary for queries that pins the
 * S3 result-output location, result encryption, a bytes-scanned cutoff, and
 * whether that configuration is enforced over per-query client settings.
 *
 * ### Creating Workgroups
 * **Example:** Workgroup with an enforced result location
 * ```typescript
 * const results = yield* AWS.S3.Bucket("AthenaResults", {});
 * const wg = yield* AWS.Athena.WorkGroup("Analytics", {
 *   outputLocation: results.bucketName.pipe(
 *     Output.map((b) => `s3://${b}/results/`),
 *   ),
 *   enforceWorkGroupConfiguration: true,
 * });
 * ```
 *
 * **Example:** Workgroup with a bytes-scanned cost guardrail
 * ```typescript
 * const wg = yield* AWS.Athena.WorkGroup("Guarded", {
 *   outputLocation: "s3://my-results-bucket/prefix/",
 *   bytesScannedCutoffPerQuery: 10_000_000, // 10 MB per query
 *   publishCloudWatchMetricsEnabled: true,
 * });
 * ```
 *
 * @resource
 */
export declare const WorkGroup: import("../../Resource.ts").ResourceClass<WorkGroup>;
export declare const WorkGroupProvider: () => import("effect/Layer").Layer<Provider.Provider<WorkGroup>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=WorkGroup.d.ts.map