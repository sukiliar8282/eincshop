import * as TSQ from "@distilled.cloud/aws/timestream-query";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export type ScheduledQueryState = TSQ.ScheduledQueryState;
export interface ScheduledQueryErrorReportS3 {
    /**
     * Name of the S3 bucket where error reports for failed runs are written.
     */
    bucketName: string;
    /**
     * Object key prefix for error report objects.
     */
    objectKeyPrefix?: string;
    /**
     * Server-side encryption for error report objects.
     * @default "SSE_S3"
     */
    encryptionOption?: TSQ.S3EncryptionOption;
}
export interface ScheduledQueryProps {
    /**
     * Name of the scheduled query. Must be unique within the account and
     * region.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * The SQL the scheduled query runs on each invocation.
     */
    queryString: string;
    /**
     * When to run the query — a cron (`cron(0 12 * * ? *)`) or rate
     * (`rate(1 hour)`) expression.
     */
    scheduleExpression: string;
    /**
     * ARN of the SNS topic Timestream notifies after each run.
     */
    notificationTopicArn: string;
    /**
     * ARN of the IAM role Timestream assumes to run the query, write results,
     * publish notifications, and write error reports.
     */
    executionRoleArn: string;
    /**
     * Where results are written (a Timestream table with measure/dimension
     * mappings). Omit for queries whose results are not materialized.
     */
    targetConfiguration?: TSQ.TargetConfiguration;
    /**
     * S3 location where error reports for failed runs are written.
     */
    errorReportS3: ScheduledQueryErrorReportS3;
    /**
     * The KMS key used to encrypt the scheduled query resource at rest. When
     * omitted, Timestream uses an AWS-owned key.
     */
    kmsKeyId?: string;
    /**
     * Whether the schedule is active.
     * @default "ENABLED"
     */
    state?: ScheduledQueryState;
    /**
     * Tags to associate with the scheduled query.
     */
    tags?: Record<string, string>;
}
export interface ScheduledQuery extends Resource<"AWS.Timestream.ScheduledQuery", ScheduledQueryProps, {
    /**
     * ARN of the scheduled query.
     */
    scheduledQueryArn: string;
    /**
     * The scheduled query's physical name.
     */
    name: string;
    /**
     * Whether the schedule is currently active.
     */
    state: ScheduledQueryState;
    /**
     * Current tags reported for the scheduled query.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon Timestream for LiveAnalytics scheduled query — a SQL query
 * Timestream runs on a cron/rate schedule, materializing results into a
 * target table and notifying an SNS topic after each run.
 *
 * Only the `state` (ENABLED/DISABLED) is mutable in place; changing the
 * query, schedule, notification topic, role, target, error report location,
 * or KMS key replaces the scheduled query. Tags sync in place.
 *
 * :::note
 * Timestream for LiveAnalytics is closed to new AWS customers. Accounts that
 * were not already onboarded receive `TimestreamNotOnboarded` (a specialized
 * `AccessDenied`) on every operation.
 * :::
 * ### Creating Scheduled Queries
 * **Example:** Hourly Rollup
 * ```typescript
 * import * as Timestream from "alchemy/AWS/Timestream";
 *
 * const rollup = yield* Timestream.ScheduledQuery("HourlyRollup", {
 *   queryString: `SELECT host, AVG(measure_value::double) AS avg_cpu
 *                 FROM "metrics"."cpu"
 *                 WHERE time > ago(1h) GROUP BY host`,
 *   scheduleExpression: "rate(1 hour)",
 *   notificationTopicArn: topic.topicArn,
 *   executionRoleArn: role.roleArn,
 *   errorReportS3: { bucketName: bucket.bucketName },
 *   targetConfiguration: {
 *     TimestreamConfiguration: {
 *       DatabaseName: database.databaseName,
 *       TableName: rollupTable.tableName,
 *       TimeColumn: "time",
 *       DimensionMappings: [{ Name: "host", DimensionValueType: "VARCHAR" }],
 *       MultiMeasureMappings: {
 *         TargetMultiMeasureName: "cpu_rollup",
 *         MultiMeasureAttributeMappings: [
 *           { SourceColumn: "avg_cpu", MeasureValueType: "DOUBLE" },
 *         ],
 *       },
 *     },
 *   },
 * });
 * ```
 *
 * **Example:** Pausing a Schedule
 * ```typescript
 * const rollup = yield* Timestream.ScheduledQuery("HourlyRollup", {
 *   // ... unchanged configuration ...
 *   state: "DISABLED",
 * });
 * ```
 *
 * @resource
 */
export declare const ScheduledQuery: import("../../Resource.ts").ResourceClass<ScheduledQuery>;
export declare const ScheduledQueryProvider: () => import("effect/Layer").Layer<Provider.Provider<ScheduledQuery>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ScheduledQuery.d.ts.map