import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment, type AccountID } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
export type DeliveryStreamName = string;
export type DeliveryStreamArn = `arn:aws:firehose:${RegionID}:${AccountID}:deliverystream/${DeliveryStreamName}`;
export type DeliveryStreamStatus = "CREATING" | "CREATING_FAILED" | "DELETING" | "DELETING_FAILED" | "ACTIVE";
export type DeliveryStreamSourceType = "DirectPut" | "KinesisStreamAsSource";
export type CompressionFormat = "UNCOMPRESSED" | "GZIP" | "ZIP" | "Snappy" | "HADOOP_SNAPPY";
export interface KinesisStreamSourceProps {
    /**
     * ARN of the Kinesis Data Stream that feeds the delivery stream.
     * Changing the source stream replaces the delivery stream.
     */
    kinesisStreamArn: string;
    /**
     * ARN of the IAM role Firehose assumes to read from the Kinesis stream.
     * @default a role is auto-created granting kinesis:DescribeStream,
     * kinesis:GetShardIterator, kinesis:GetRecords and kinesis:ListShards on
     * the source stream.
     */
    roleArn?: string;
}
export interface S3DestinationProps {
    /**
     * ARN of the destination S3 bucket.
     */
    bucketArn: string;
    /**
     * ARN of the IAM role Firehose assumes to write to the bucket.
     * @default a role is auto-created granting s3:PutObject, s3:GetObject,
     * s3:ListBucket, s3:GetBucketLocation, s3:AbortMultipartUpload and
     * s3:ListBucketMultipartUploads on the bucket.
     */
    roleArn?: string;
    /**
     * Prefix prepended to delivered S3 object keys.
     */
    prefix?: string;
    /**
     * Prefix for objects that failed delivery or transformation.
     */
    errorOutputPrefix?: string;
    /**
     * Buffering interval before flushing to S3 — e.g. `"1 minute"` or
     * `Duration.seconds(60)`. Sent to AWS as whole seconds; valid values range
     * from 0 (zero buffering) to 900 seconds.
     * @default "300 seconds"
     */
    bufferingInterval?: Duration.Input;
    /**
     * Buffering size in MiB before flushing to S3.
     * Valid values range from 1 to 128.
     * @default 5
     */
    bufferingSizeInMBs?: number;
    /**
     * Compression format applied to delivered objects.
     * @default "UNCOMPRESSED"
     */
    compressionFormat?: CompressionFormat;
}
export type DeliveryStreamEncryptionKeyType = "AWS_OWNED_CMK" | "CUSTOMER_MANAGED_CMK";
export type DeliveryStreamEncryptionStatus = "ENABLED" | "ENABLING" | "ENABLING_FAILED" | "DISABLED" | "DISABLING" | "DISABLING_FAILED";
export interface DeliveryStreamEncryptionProps {
    /**
     * Which key to use for server-side encryption: the AWS-owned CMK that
     * Firehose manages for you, or a customer-managed KMS key (`keyArn`
     * required).
     */
    keyType: DeliveryStreamEncryptionKeyType;
    /**
     * ARN of the customer-managed KMS key. Required when `keyType` is
     * `CUSTOMER_MANAGED_CMK`; must be omitted for `AWS_OWNED_CMK`.
     */
    keyArn?: string;
}
export interface DeliveryStreamProps {
    /**
     * Name of the delivery stream. Changing the name replaces the stream.
     * @default ${app}-${id}-${stage}-${instanceId}
     */
    deliveryStreamName?: string;
    /**
     * Kinesis Data Stream source. When omitted the stream is `DirectPut` and
     * producers write via `PutRecord` / `PutRecordBatch`. Adding, removing or
     * changing the source replaces the delivery stream.
     */
    source?: KinesisStreamSourceProps;
    /**
     * S3 destination configuration (Firehose "extended S3" destination).
     * Destination settings update in place via `UpdateDestination`.
     */
    destination: S3DestinationProps;
    /**
     * Server-side encryption (SSE) for records at rest inside the delivery
     * stream. Only supported for `DirectPut` streams — streams with a Kinesis
     * source inherit encryption from the source stream. Adding, changing or
     * removing encryption updates the stream in place via
     * `StartDeliveryStreamEncryption` / `StopDeliveryStreamEncryption`.
     * @default no server-side encryption
     */
    encryption?: DeliveryStreamEncryptionProps;
    /**
     * Tags to associate with the delivery stream.
     */
    tags?: Record<string, string>;
}
export interface DeliveryStream extends Resource<"AWS.Firehose.DeliveryStream", DeliveryStreamProps, {
    /**
     * The delivery stream's physical name.
     */
    deliveryStreamName: DeliveryStreamName;
    /**
     * ARN of the delivery stream.
     */
    deliveryStreamArn: DeliveryStreamArn;
    /**
     * Current lifecycle status of the delivery stream.
     */
    deliveryStreamStatus: DeliveryStreamStatus;
    /**
     * Source type of the delivery stream.
     */
    deliveryStreamType: DeliveryStreamSourceType;
    /**
     * Current version ID of the delivery stream configuration.
     */
    versionId: string;
    /**
     * ID of the (single) destination attached to the stream.
     */
    destinationId: string | undefined;
    /**
     * ARN of the destination S3 bucket.
     */
    bucketArn: string;
    /**
     * ARN of the IAM role Firehose assumes to write to the destination.
     */
    roleArn: string;
    /**
     * Name of the auto-created IAM role, when one was synthesized for this
     * stream. `undefined` when the caller supplied every role ARN.
     */
    roleName: string | undefined;
    /**
     * ARN of the source Kinesis stream, for `KinesisStreamAsSource` streams.
     */
    kinesisStreamArn: string | undefined;
    /**
     * Prefix prepended to delivered S3 object keys.
     */
    prefix: string | undefined;
    /**
     * Prefix for objects that failed delivery.
     */
    errorOutputPrefix: string | undefined;
    /**
     * Buffering interval in seconds currently configured on the destination.
     */
    bufferingIntervalInSeconds: number | undefined;
    /**
     * Buffering size in MiB currently configured on the destination.
     */
    bufferingSizeInMBs: number | undefined;
    /**
     * Compression format currently configured on the destination.
     */
    compressionFormat: CompressionFormat | undefined;
    /**
     * Server-side encryption status reported by the stream — `ENABLED` when
     * SSE is active, `DISABLED` when it is not.
     */
    encryptionStatus: DeliveryStreamEncryptionStatus | undefined;
    /**
     * Key type used for server-side encryption, when enabled.
     */
    encryptionKeyType: DeliveryStreamEncryptionKeyType | undefined;
    /**
     * ARN of the customer-managed KMS key used for server-side encryption,
     * when `encryptionKeyType` is `CUSTOMER_MANAGED_CMK`.
     */
    encryptionKeyArn: string | undefined;
    /**
     * Current tags reported for the delivery stream.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon Data Firehose delivery stream that buffers records and delivers
 * them to an S3 bucket.
 *
 * `DeliveryStream` owns the stream's lifecycle and mutable destination
 * configuration (buffering hints, compression, prefixes, tags). The stream is
 * `DirectPut` by default — producers write with `PutRecord` /
 * `PutRecordBatch` — or it can drain an existing Kinesis Data Stream via the
 * `source` prop. Unless you supply role ARNs, an IAM role is auto-created
 * granting Firehose write access to the destination bucket (and read access
 * to the source stream when one is configured).
 * ### Creating Delivery Streams
 * **Example:** DirectPut stream delivering to S3
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const bucket = yield* AWS.S3.Bucket("DataLake");
 * const stream = yield* AWS.Firehose.DeliveryStream("Events", {
 *   destination: {
 *     bucketArn: bucket.bucketArn,
 *   },
 * });
 * ```
 *
 * **Example:** Tuned buffering and compression
 * ```typescript
 * const stream = yield* AWS.Firehose.DeliveryStream("Events", {
 *   destination: {
 *     bucketArn: bucket.bucketArn,
 *     prefix: "events/",
 *     errorOutputPrefix: "errors/",
 *     bufferingInterval: "1 minute",
 *     bufferingSizeInMBs: 1,
 *     compressionFormat: "GZIP",
 *   },
 * });
 * ```
 *
 * **Example:** Server-side encryption at rest
 * ```typescript
 * const stream = yield* AWS.Firehose.DeliveryStream("Events", {
 *   destination: { bucketArn: bucket.bucketArn },
 *   encryption: { keyType: "AWS_OWNED_CMK" },
 * });
 * ```
 *
 * **Example:** Kinesis Data Stream as source
 * ```typescript
 * const source = yield* AWS.Kinesis.Stream("Clickstream");
 * const stream = yield* AWS.Firehose.DeliveryStream("ClickstreamArchive", {
 *   source: { kinesisStreamArn: source.streamArn },
 *   destination: { bucketArn: bucket.bucketArn },
 * });
 * ```
 *
 * ### Runtime Producers
 * Bind producer operations in the init phase and use them in runtime
 * handlers. Records are buffered by Firehose and appear in S3 after the
 * buffering interval elapses.
 *
 * **Example:** Put a record from a handler
 * ```typescript
 * // init
 * const putRecord = yield* AWS.Firehose.PutRecord(stream);
 *
 * return {
 *   fetch: Effect.gen(function* () {
 *     // runtime
 *     const response = yield* putRecord({
 *       Record: { Data: new TextEncoder().encode("hello\n") },
 *     });
 *     return HttpServerResponse.json({ recordId: response.RecordId });
 *   }),
 * };
 * ```
 *
 * **Example:** Put a batch of records
 * ```typescript
 * // init
 * const putRecordBatch = yield* AWS.Firehose.PutRecordBatch(stream);
 *
 * // runtime
 * const response = yield* putRecordBatch({
 *   Records: lines.map((line) => ({
 *     Data: new TextEncoder().encode(`${line}\n`),
 *   })),
 * });
 * ```
 *
 * @resource
 */
export declare const DeliveryStream: import("../../Resource.ts").ResourceClass<DeliveryStream>;
declare const DeliveryStreamCreateFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "DeliveryStreamCreateFailed";
} & Readonly<A>;
/**
 * The delivery stream entered `CREATING_FAILED` — AWS never recovers this
 * state; the stream must be deleted and recreated.
 */
export declare class DeliveryStreamCreateFailed extends DeliveryStreamCreateFailed_base<{
    readonly deliveryStreamName: string;
    readonly details: string | undefined;
}> {
}
declare const DeliveryStreamValidationError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "DeliveryStreamValidationError";
} & Readonly<A>;
/**
 * Validation error raised before any AWS call when the props are invalid.
 */
export declare class DeliveryStreamValidationError extends DeliveryStreamValidationError_base<{
    readonly message: string;
}> {
}
declare const DeliveryStreamEncryptionFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "DeliveryStreamEncryptionFailed";
} & Readonly<A>;
/**
 * Server-side encryption reached a terminal failure state
 * (`ENABLING_FAILED` / `DISABLING_FAILED`) while converging to the desired
 * encryption configuration.
 */
export declare class DeliveryStreamEncryptionFailed extends DeliveryStreamEncryptionFailed_base<{
    readonly deliveryStreamName: string;
    readonly status: string;
    readonly details: string | undefined;
}> {
}
export declare const DeliveryStreamProvider: () => import("effect/Layer").Layer<Provider.Provider<DeliveryStream>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=DeliveryStream.d.ts.map