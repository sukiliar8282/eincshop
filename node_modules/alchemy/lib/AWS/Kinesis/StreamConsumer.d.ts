import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { StreamArn } from "./Stream.ts";
export type ConsumerName = string;
export type ConsumerArn = string;
export type ConsumerStatus = "CREATING" | "DELETING" | "ACTIVE";
export interface StreamConsumerProps {
    /**
     * ARN of the stream that owns the consumer.
     */
    streamArn: Input<StreamArn>;
    /**
     * Name of the stream consumer.
     * @default ${app}-${stage}-${id}
     */
    consumerName?: string;
    /**
     * Tags to associate with the consumer.
     */
    tags?: Record<string, string>;
}
export interface StreamConsumer extends Resource<"AWS.Kinesis.StreamConsumer", StreamConsumerProps, {
    /**
     * The consumer's physical name.
     */
    consumerName: ConsumerName;
    /**
     * ARN of the registered consumer.
     */
    consumerArn: ConsumerArn;
    /**
     * Current lifecycle status of the consumer.
     */
    consumerStatus: ConsumerStatus;
    /**
     * ARN of the stream the consumer is registered on.
     */
    streamArn: StreamArn;
    /**
     * When the consumer was registered.
     */
    consumerCreationTimestamp: Date;
    /**
     * Current tags reported for the consumer.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * A registered Kinesis enhanced fan-out consumer.
 *
 * `StreamConsumer` is the canonical lifecycle resource for
 * `RegisterStreamConsumer` / `DeregisterStreamConsumer`.
 * ### Creating Consumers
 * **Example:** Register a Consumer
 * ```typescript
 * const consumer = yield* StreamConsumer("AnalyticsConsumer", {
 *   streamArn: stream.streamArn,
 * });
 * ```
 *
 * @resource
 */
export declare const StreamConsumer: import("../../Resource.ts").ResourceClass<StreamConsumer>;
export declare const StreamConsumerProvider: () => import("effect/Layer").Layer<Provider.Provider<StreamConsumer>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=StreamConsumer.d.ts.map