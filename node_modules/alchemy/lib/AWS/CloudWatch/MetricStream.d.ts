import * as cloudwatch from "@distilled.cloud/aws/cloudwatch";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment, type AccountID } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
export type MetricStreamName = string;
export type MetricStreamArn = `arn:aws:cloudwatch:${RegionID}:${AccountID}:metric-stream/${string}`;
export interface MetricStreamProps extends Omit<cloudwatch.PutMetricStreamInput, "Name" | "Tags"> {
    /**
     * Name of the metric stream. If omitted, a unique name is generated.
     */
    name?: MetricStreamName;
    /**
     * Whether the stream should be running after deployment.
     * @default true
     */
    enabled?: boolean;
    /**
     * Optional tags to apply to the metric stream.
     */
    tags?: Record<string, string>;
}
export interface MetricStream extends Resource<"AWS.CloudWatch.MetricStream", MetricStreamProps, {
    /** Physical name of the metric stream. */
    metricStreamName: MetricStreamName;
    /** ARN of the metric stream. */
    metricStreamArn: MetricStreamArn;
    /** Current state of the stream (`running` or `stopped`). */
    state: string | undefined;
    /** The full metric stream description as last read from CloudWatch. */
    metricStream: cloudwatch.GetMetricStreamOutput;
    /** Tags on the metric stream, including the internal Alchemy ownership tags. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * A CloudWatch metric stream — continuously exports CloudWatch metrics to
 * a Kinesis Data Firehose delivery stream (and on to S3, Datadog, etc.).
 * ### Creating Metric Streams
 * **Example:** Firehose Delivery Stream
 * ```typescript
 * const stream = yield* MetricStream("MetricsExport", {
 *   FirehoseArn: "arn:aws:firehose:us-east-1:123456789012:deliverystream/example",
 *   RoleArn: "arn:aws:iam::123456789012:role/example",
 *   OutputFormat: "json",
 * });
 * ```
 *
 * **Example:** Stream Only Selected Namespaces
 * ```typescript
 * const stream = yield* MetricStream("LambdaMetricsExport", {
 *   FirehoseArn: firehose.deliveryStreamArn,
 *   RoleArn: role.roleArn,
 *   OutputFormat: "json",
 *   IncludeFilters: [{ Namespace: "AWS/Lambda" }],
 * });
 * ```
 *
 * ### Reading Metric Streams at Runtime
 * **Example:** Read the Stream's State from a Function
 * ```typescript
 * // init — bind the stream to the function (see GetMetricStream)
 * const getMetricStream = yield* AWS.CloudWatch.GetMetricStream(stream);
 *
 * // runtime
 * const result = yield* getMetricStream();
 * const state = result.State; // "running" | "stopped"
 * ```
 *
 * @resource
 */
export declare const MetricStream: import("../../Resource.ts").ResourceClass<MetricStream>;
export declare const MetricStreamProvider: () => import("effect/Layer").Layer<Provider.Provider<MetricStream>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=MetricStream.d.ts.map