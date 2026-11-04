export type * as lambda from "aws-lambda";
import type * as lambda from "aws-lambda";
import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment, type AccountID } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
export type StreamRecord = lambda.KinesisStreamRecord;
export type StreamEvent = lambda.KinesisStreamEvent;
export type StreamName = string;
export type StreamArn = `arn:aws:kinesis:${RegionID}:${AccountID}:stream/${StreamName}`;
export type StreamStatus = "CREATING" | "DELETING" | "ACTIVE" | "UPDATING";
export type StreamMode = "PROVISIONED" | "ON_DEMAND";
export type EncryptionType = "NONE" | "KMS";
export type WarmThroughput = {
    /**
     * Requested warm throughput in MiBps.
     */
    targetMiBps?: number;
    /**
     * Warm throughput currently provisioned by AWS, in MiBps.
     */
    currentMiBps?: number;
};
export type StreamProps = {
    /**
     * Name of the stream.
     * @default ${app}-${stage}-${id}
     */
    streamName?: string;
    /**
     * The capacity mode of the data stream.
     * - PROVISIONED: You specify the number of shards for the data stream.
     * - ON_DEMAND: AWS manages the shards for the data stream.
     * @default "ON_DEMAND"
     */
    streamMode?: StreamMode;
    /**
     * The number of shards that the stream will use when in PROVISIONED mode.
     * Required when `streamMode` is `"PROVISIONED"`.
     */
    shardCount?: number;
    /**
     * How long records remain accessible in the stream, e.g. `"48 hours"` or
     * `Duration.hours(48)`. The API stores whole hours; valid values range
     * from 24 hours to 8760 hours (365 days).
     * @default "24 hours"
     */
    retentionPeriod?: Duration.Input;
    /**
     * If set to true, server-side encryption is enabled on the stream.
     * Uses the AWS managed CMK for Kinesis (`alias/aws/kinesis`) when `kmsKeyId`
     * is omitted.
     * @default false
     */
    encryption?: boolean;
    /**
     * The AWS KMS key to use when encryption is enabled.
     */
    kmsKeyId?: string;
    /**
     * A list of shard-level CloudWatch metrics to enable for the stream.
     */
    shardLevelMetrics?: ShardLevelMetric[];
    /**
     * Pre-provisioned warm throughput for on-demand streams, in MiBps.
     */
    warmThroughputMiBps?: number;
    /**
     * Maximum size of a single record, in KiB.
     */
    maxRecordSizeInKiB?: number;
    /**
     * Resource policy attached to the stream.
     */
    resourcePolicy?: string;
    /**
     * Tags to associate with the stream.
     */
    tags?: Record<string, string>;
};
export interface Stream extends Resource<"AWS.Kinesis.Stream", StreamProps, {
    /**
     * The stream's physical name.
     */
    streamName: StreamName;
    /**
     * ARN of the stream.
     */
    streamArn: StreamArn;
    /**
     * Provider-assigned unique identifier for the stream, when returned by AWS.
     */
    streamId: string | undefined;
    /**
     * Current lifecycle status of the stream.
     */
    streamStatus: StreamStatus;
    /**
     * Current capacity mode of the stream.
     */
    streamMode: StreamMode;
    /**
     * Number of hours that records remain accessible in the stream.
     */
    retentionPeriodHours: number;
    /**
     * Current server-side encryption mode.
     */
    encryptionType: EncryptionType;
    /**
     * KMS key ID backing stream encryption, when encryption is enabled with KMS.
     */
    kmsKeyId: string | undefined;
    /**
     * Number of open shards currently reported by the stream summary.
     */
    openShardCount: number | undefined;
    /**
     * Number of registered consumers currently attached to the stream.
     */
    consumerCount: number | undefined;
    /**
     * Enabled shard-level CloudWatch metrics for the stream.
     */
    shardLevelMetrics: ShardLevelMetric[];
    /**
     * Current and target warm throughput settings for on-demand streams, when available.
     */
    warmThroughput: WarmThroughput | undefined;
    /**
     * Maximum record size, in KiB, that the stream accepts.
     */
    maxRecordSizeInKiB: number | undefined;
    /**
     * Current resource policy attached to the stream, if one is configured.
     */
    resourcePolicy: string | undefined;
    /**
     * Current tags reported for the stream.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon Kinesis Data Stream.
 *
 * `Stream` owns the stream's lifecycle and mutable control-plane configuration,
 * including retention, encryption, monitoring, warm throughput, record size, tags,
 * and stream resource policy. A stream name is auto-generated from the app,
 * stage, and logical ID unless you provide one explicitly.
 * ### Creating Streams
 * **Example:** On-Demand Stream
 * ```typescript
 * import * as Kinesis from "alchemy/AWS/Kinesis";
 *
 * const stream = yield* Kinesis.Stream("OrdersStream");
 * ```
 *
 * **Example:** Provisioned Stream
 * ```typescript
 * const stream = yield* Kinesis.Stream("AnalyticsStream", {
 *   streamMode: "PROVISIONED",
 *   shardCount: 2,
 *   retentionPeriod: "48 hours",
 * });
 * ```
 *
 * **Example:** Encrypted Stream
 * ```typescript
 * const stream = yield* Kinesis.Stream("SecureStream", {
 *   encryption: true,
 *   kmsKeyId: "alias/my-key",
 * });
 * ```
 *
 * ### Runtime Producers
 * Bind producer operations in the init phase and use them in runtime
 * handlers.
 *
 * **Example:** Put a record from a handler
 * ```typescript
 * // init
 * const putRecord = yield* AWS.Kinesis.PutRecord(stream);
 *
 * return {
 *   fetch: Effect.gen(function* () {
 *     // runtime
 *     yield* putRecord({
 *       PartitionKey: "order-123",
 *       Data: new TextEncoder().encode(JSON.stringify({ orderId: "123" })),
 *     });
 *     return HttpServerResponse.text("Sent");
 *   }),
 * };
 * ```
 *
 * ### Event Sources
 * Process records from a Kinesis stream using a Lambda event source
 * mapping.
 *
 * **Example:** Process stream records
 * ```typescript
 * // init
 * yield* Kinesis.consumeStreamRecords(
 *   stream,
 *   {},
 *   Effect.fn(function* (record) {
 *     const data = new TextDecoder().decode(record.data);
 *     yield* Effect.log(`Received: ${data}`);
 *   }),
 * );
 * ```
 *
 * @resource
 */
export declare const Stream: import("../../Resource.ts").ResourceClass<Stream>;
export type ShardLevelMetric = "IncomingBytes" | "IncomingRecords" | "OutgoingBytes" | "OutgoingRecords" | "WriteProvisionedThroughputExceeded" | "ReadProvisionedThroughputExceeded" | "IteratorAgeMilliseconds" | "ALL";
export declare const StreamProvider: () => import("effect/Layer").Layer<Provider.Provider<Stream>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Stream.d.ts.map