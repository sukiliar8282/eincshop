import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment, type AccountID } from "../Environment.ts";
import type { PolicyStatement } from "../IAM/Policy.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
export type QueueName = string;
export type QueueArn = `arn:aws:sqs:${RegionID}:${AccountID}:${QueueName}`;
export type QueueUrl = string;
export type QueueProps = {
    /**
     * Name of the queue.
     * @default ${app}-${stage}-${id}?.fifo
     */
    queueName?: string;
    /**
     * Delay applied to all messages in the queue (`0` - `900` seconds).
     * Accepts any `Duration.Input` (e.g. `"30 seconds"`,
     * `Duration.seconds(30)`; a bare number is milliseconds); the wire unit
     * is whole seconds.
     * @default 0
     */
    delay?: Duration.Input;
    /**
     * Maximum message size in bytes (`1,024` - `1,048,576`).
     * @default 1048576
     */
    maximumMessageSize?: number;
    /**
     * How long messages are retained (`60` - `1,209,600` seconds). Accepts
     * any `Duration.Input` (e.g. `"4 days"`, `Duration.days(4)`; a bare
     * number is milliseconds); the wire unit is whole seconds.
     * @default 4 days
     */
    messageRetentionPeriod?: Duration.Input;
    /**
     * How long `ReceiveMessage` waits for a message (`0` - `20` seconds).
     * Accepts any `Duration.Input` (e.g. `"20 seconds"`,
     * `Duration.seconds(20)`; a bare number is milliseconds); the wire unit
     * is whole seconds.
     * @default 0
     */
    receiveMessageWaitTime?: Duration.Input;
    /**
     * Visibility timeout (`0` - `43,200` seconds). Accepts any
     * `Duration.Input` (e.g. `"30 seconds"`, `Duration.seconds(30)`; a bare
     * number is milliseconds); the wire unit is whole seconds.
     * @default 30 seconds
     */
    visibilityTimeout?: Duration.Input;
    /**
     * Dead-letter queue redrive policy. Failed messages are moved to the
     * dead-letter queue after `maxReceiveCount` receive attempts. The
     * dead-letter queue must be the same type (a FIFO source requires a
     * FIFO dead-letter queue).
     */
    redrivePolicy?: {
        /**
         * The ARN of the dead-letter queue that failed messages are moved to.
         */
        deadLetterTargetArn: string;
        /**
         * The number of times a message is received before it is moved to the
         * dead-letter queue (`1` - `1000`).
         */
        maxReceiveCount: number;
    };
    /**
     * Redrive-allow policy. Set on the **dead-letter queue** to authorize
     * which source queues may use it.
     */
    redriveAllowPolicy?: {
        /**
         * Whether all, none, or a specified list of source queues may use this
         * queue as a dead-letter queue.
         */
        redrivePermission: "allowAll" | "denyAll" | "byQueue";
        /**
         * The ARNs of the source queues permitted to use this dead-letter
         * queue. Only valid (and required) when `redrivePermission` is
         * `byQueue` (up to 10 ARNs).
         */
        sourceQueueArns?: string[];
    };
    /**
     * An access-control policy document (IAM policy JSON) attached to the
     * queue. Provided as a JSON string or a plain object. Merged with any
     * policy statements contributed by capability bindings.
     */
    policy?: string | Record<string, any>;
    /**
     * The ID, alias, or ARN of a KMS key for server-side encryption (SSE-KMS).
     * Use `alias/aws/sqs` for the AWS-managed SQS key. Mutually exclusive with
     * `sqsManagedSseEnabled`.
     */
    kmsMasterKeyId?: string;
    /**
     * How long SQS reuses a data key before calling KMS again (`60` -
     * `86,400` seconds). Accepts any `Duration.Input` (e.g. `"5 minutes"`,
     * `Duration.minutes(5)`; a bare number is milliseconds); the wire unit
     * is whole seconds. Only meaningful with `kmsMasterKeyId`.
     * @default 5 minutes
     */
    kmsDataKeyReusePeriod?: Duration.Input;
    /**
     * Enables server-side encryption using SQS-owned keys (SSE-SQS).
     * Mutually exclusive with `kmsMasterKeyId`.
     * @default false
     */
    sqsManagedSseEnabled?: boolean;
    /**
     * Tags to apply to the queue. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
} & ({
    fifo?: false;
    contentBasedDeduplication?: undefined;
    deduplicationScope?: undefined;
    fifoThroughputLimit?: undefined;
} | {
    fifo: true;
    /**
     * Enables content-based deduplication for FIFO queues. Only valid when `fifo` is `true`.
     * @default false
     */
    contentBasedDeduplication?: boolean;
    /**
     * Specifies whether message deduplication occurs at the message group or queue level.
     * Valid values are `messageGroup` and `queue`. Only valid when `fifo` is `true`.
     */
    deduplicationScope?: "messageGroup" | "queue";
    /**
     * Specifies whether the FIFO queue throughput quota applies to the entire queue or per message group.
     * Valid values are `perQueue` and `perMessageGroupId`. Only valid when `fifo` is `true`.
     */
    fifoThroughputLimit?: "perQueue" | "perMessageGroupId";
});
export interface Queue extends Resource<"AWS.SQS.Queue", QueueProps, {
    queueUrl: string;
    queueName: QueueName;
    queueArn: QueueArn;
}, {
    policyStatements: PolicyStatement[];
}, Providers> {
}
/**
 * An Amazon SQS queue for reliable, decoupled message processing.
 *
 * `Queue` owns the lifecycle of a standard or FIFO SQS queue. A queue name
 * is auto-generated from the app, stage, and logical ID unless you provide
 * one explicitly. FIFO queues automatically append the `.fifo` suffix.
 * ### Creating Queues
 * **Example:** Standard Queue
 * ```typescript
 * import * as SQS from "alchemy/AWS/SQS";
 *
 * const queue = yield* SQS.Queue("OrdersQueue");
 * ```
 *
 * **Example:** FIFO Queue
 * ```typescript
 * const queue = yield* SQS.Queue("OrdersFifoQueue", {
 *   fifo: true,
 *   contentBasedDeduplication: true,
 * });
 * ```
 *
 * **Example:** Queue with Custom Settings
 * ```typescript
 * const queue = yield* SQS.Queue("ProcessingQueue", {
 *   visibilityTimeout: "2 minutes",
 *   messageRetentionPeriod: "1 day",
 *   receiveMessageWaitTime: "20 seconds",
 * });
 * ```
 *
 * ### Dead-Letter Queues
 * **Example:** Route failures to a dead-letter queue
 * ```typescript
 * const dlq = yield* SQS.Queue("OrdersDLQ");
 * const orders = yield* SQS.Queue("Orders", {
 *   redrivePolicy: {
 *     deadLetterTargetArn: dlq.queueArn,
 *     maxReceiveCount: 3,
 *   },
 * });
 * ```
 *
 * **Example:** Authorize source queues on the dead-letter queue
 * ```typescript
 * const dlq = yield* SQS.Queue("OrdersDLQ", {
 *   redriveAllowPolicy: {
 *     redrivePermission: "byQueue",
 *     sourceQueueArns: [orders.queueArn],
 *   },
 * });
 * ```
 *
 * ### Encryption
 * **Example:** SSE-SQS (SQS-managed keys)
 * ```typescript
 * const queue = yield* SQS.Queue("SecureQueue", {
 *   sqsManagedSseEnabled: true,
 * });
 * ```
 *
 * **Example:** SSE-KMS (AWS-managed key)
 * ```typescript
 * const queue = yield* SQS.Queue("KmsQueue", {
 *   kmsMasterKeyId: "alias/aws/sqs",
 *   kmsDataKeyReusePeriod: "5 minutes",
 * });
 * ```
 *
 * ### Sending Messages
 * Bind send operations in the init phase and use them in runtime
 * handlers.
 *
 * **Example:** Send a message from a handler
 * ```typescript
 * // init
 * const sendMessage = yield* SQS.SendMessage(queue);
 *
 * return {
 *   fetch: Effect.gen(function* () {
 *     // runtime
 *     yield* sendMessage({
 *       MessageBody: JSON.stringify({ orderId: "123" }),
 *     });
 *     return HttpServerResponse.text("Queued");
 *   }),
 * };
 * ```
 *
 * ### Event Sources
 * Process messages from a queue using a Lambda event source mapping.
 * Messages are automatically deleted after successful processing.
 *
 * **Example:** Process queue messages
 * ```typescript
 * // init
 * yield* SQS.consumeQueueMessages(queue,
 *   Effect.fn(function* (message) {
 *     yield* Effect.log(`Received: ${message.body}`);
 *   }),
 * );
 * ```
 *
 * @resource
 */
export declare const Queue: import("../../Resource.ts").ResourceClass<Queue>;
declare const SqsEncryptionConflict_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SqsEncryptionConflict";
} & Readonly<A>;
/**
 * Raised when a `Queue` is configured with both `kmsMasterKeyId` (SSE-KMS)
 * and `sqsManagedSseEnabled` (SSE-SQS). The two encryption modes are
 * mutually exclusive.
 */
export declare class SqsEncryptionConflict extends SqsEncryptionConflict_base<{
    message: string;
}> {
}
export declare const QueueProvider: () => import("effect/Layer").Layer<Provider.Provider<Queue>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=Queue.d.ts.map