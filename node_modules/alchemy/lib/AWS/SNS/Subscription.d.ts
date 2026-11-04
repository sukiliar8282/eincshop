import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export type SubscriptionArn = string;
export interface SubscriptionProps {
    /**
     * ARN of the topic to subscribe to.
     */
    topicArn: Input<string>;
    /**
     * SNS subscription protocol, for example `lambda`, `sqs`, `https`, or `email`.
     */
    protocol: string;
    /**
     * Endpoint for the selected protocol, such as a Lambda function ARN or queue ARN.
     */
    endpoint?: Input<string>;
    /**
     * Raw SNS subscription attributes keyed by AWS attribute name.
     */
    attributes?: Record<string, string>;
    /**
     * Whether SNS should return the subscription ARN immediately, even while pending confirmation.
     * @default true
     */
    returnSubscriptionArn?: boolean;
}
export interface Subscription extends Resource<"AWS.SNS.Subscription", SubscriptionProps, {
    /** ARN of the subscription. */
    subscriptionArn: SubscriptionArn;
    /** ARN of the topic the subscription is attached to. */
    topicArn: string;
    /** Delivery protocol of the subscription (e.g. `lambda`, `sqs`, `https`). */
    protocol: string;
    /** Endpoint receiving deliveries, such as a Lambda function or queue ARN. */
    endpoint: string | undefined;
    /** AWS account ID that owns the subscription. */
    owner: string | undefined;
    /** Whether the subscription is still awaiting endpoint confirmation. */
    pendingConfirmation: boolean;
    /** Raw SNS subscription attributes keyed by AWS attribute name. */
    attributes: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon SNS subscription that attaches an endpoint to a topic.
 *
 * `Subscription` keeps the lifecycle of the subscription itself separate from the
 * topic, which lets Lambda event sources and manually managed subscriptions share
 * the same canonical resource model.
 * ### Creating Subscriptions
 * **Example:** Lambda Subscription
 * ```typescript
 * const subscription = yield* Subscription("TopicSubscription", {
 *   topicArn: topic.topicArn,
 *   protocol: "lambda",
 *   endpoint: fn.functionArn,
 * });
 * ```
 *
 * **Example:** Fan Out a Topic to an SQS Queue
 * ```typescript
 * const topic = yield* SNS.Topic("Events");
 * const queue = yield* SQS.Queue("Notifications");
 *
 * const subscription = yield* Subscription("QueueSubscription", {
 *   topicArn: topic.topicArn,
 *   protocol: "sqs",
 *   endpoint: queue.queueArn,
 *   returnSubscriptionArn: true,
 * });
 * ```
 *
 * **Example:** Filtered Subscription
 * ```typescript
 * const subscription = yield* Subscription("OrderSubscription", {
 *   topicArn: topic.topicArn,
 *   protocol: "sqs",
 *   endpoint: queue.queueArn,
 *   attributes: {
 *     FilterPolicy: JSON.stringify({ type: ["order"] }),
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Subscription: import("../../Resource.ts").ResourceClass<Subscription>;
export declare const SubscriptionProvider: () => import("effect/Layer").Layer<Provider.Provider<Subscription>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=Subscription.d.ts.map