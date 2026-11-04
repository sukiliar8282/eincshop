import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { AccountID } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
export type TopicName = string;
export type TopicArn = `arn:aws:sns:${RegionID}:${AccountID}:${TopicName}`;
export interface TopicProps {
    /**
     * Name of the topic.
     * @default ${app}-${stage}-${id}?.fifo
     */
    topicName?: string;
    /**
     * Whether to create a FIFO topic.
     * @default false
     */
    fifo?: boolean;
    /**
     * Raw SNS topic attributes keyed by AWS attribute name.
     * Use this for delivery policies, tracing, KMS, signatures, archive policy, and
     * other SNS topic attributes not modeled as first-class props.
     */
    attributes?: Record<string, string>;
    /**
     * SNS data protection policy JSON for the topic.
     *
     * TODO(sam): should this be a typed object that we serialize/deserialize?
     */
    dataProtectionPolicy?: string;
    /**
     * User-defined tags to apply to the topic.
     */
    tags?: Record<string, string>;
}
export interface Topic extends Resource<"AWS.SNS.Topic", TopicProps, {
    topicArn: TopicArn;
    topicName: TopicName;
    fifo: boolean;
    attributes: Record<string, string>;
    dataProtectionPolicy: string | undefined;
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon SNS topic for fan-out messaging and notifications.
 *
 * `Topic` owns the SNS topic lifecycle while raw AWS topic attributes remain
 * available through the `attributes` prop so the full core pub/sub surface can
 * be configured without waiting on additional typed wrappers. A topic name is
 * auto-generated unless you provide one explicitly.
 * ### Creating Topics
 * **Example:** Standard Topic
 * ```typescript
 * import * as SNS from "alchemy/AWS/SNS";
 *
 * const topic = yield* SNS.Topic("OrdersTopic");
 * ```
 *
 * **Example:** Topic with Display Name
 * ```typescript
 * const topic = yield* SNS.Topic("NotificationsTopic", {
 *   attributes: {
 *     DisplayName: "App Notifications",
 *   },
 * });
 * ```
 *
 * **Example:** FIFO Topic
 * ```typescript
 * const topic = yield* SNS.Topic("OrdersFifoTopic", {
 *   fifo: true,
 *   attributes: {
 *     ContentBasedDeduplication: "true",
 *   },
 * });
 * ```
 *
 * ### Runtime Publishing
 * Bind publish operations in the init phase and use them in runtime
 * handlers.
 *
 * **Example:** Publish from a handler
 * ```typescript
 * // init
 * const publish = yield* SNS.Publish(topic);
 *
 * return {
 *   fetch: Effect.gen(function* () {
 *     // runtime
 *     yield* publish({
 *       Message: JSON.stringify({ orderId: "123" }),
 *       Subject: "OrderCreated",
 *     });
 *     return HttpServerResponse.text("Published");
 *   }),
 * };
 * ```
 *
 * ### Subscriptions
 * Subscribe a Lambda function to process messages published to the
 * topic. The subscription and invoke permissions are created
 * automatically.
 *
 * **Example:** Process topic notifications
 * ```typescript
 * // init
 * yield* SNS.consumeTopicNotifications(topic, (stream) =>
 *   stream.pipe(
 *     Stream.runForEach((message) =>
 *       Effect.log(`Received: ${message.Message}`),
 *     ),
 *   ),
 * );
 * ```
 *
 * @resource
 */
export declare const Topic: import("../../Resource.ts").ResourceClass<Topic>;
export declare const TopicProvider: () => import("effect/Layer").Layer<Provider.Provider<Topic>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Topic.d.ts.map