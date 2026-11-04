import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * HTTPS delivery settings for a subscriber notification.
 */
export interface SubscriberHttpsNotificationConfiguration {
    /** The HTTPS endpoint Security Lake POSTs/PUTs object notifications to. */
    endpoint: string;
    /**
     * ARN of the EventBridge API-destination role Security Lake assumes to
     * invoke the endpoint.
     */
    targetRoleArn: string;
    /**
     * Name of the API-key header sent with each notification.
     */
    authorizationApiKeyName?: string;
    /**
     * Value of the API-key header sent with each notification. Held as a
     * `Redacted` secret; it is never persisted or logged in plaintext.
     */
    authorizationApiKeyValue?: Redacted.Redacted<string>;
    /**
     * The HTTP method used to deliver notifications.
     * @default "POST"
     */
    httpMethod?: "POST" | "PUT";
}
export interface SubscriberNotificationProps {
    /**
     * ID of the `SecurityLake.Subscriber` the notification is configured for.
     * Changing this replaces the notification.
     */
    subscriberId: string;
    /**
     * Deliver new-object notifications to an AWS-managed SQS queue (Security
     * Lake creates the queue). Exactly one of `sqs` or
     * `httpsNotificationConfiguration` must be set.
     * @default false
     */
    sqs?: boolean;
    /**
     * Deliver new-object notifications to a custom HTTPS endpoint. Exactly one
     * of `sqs` or `httpsNotificationConfiguration` must be set.
     */
    httpsNotificationConfiguration?: SubscriberHttpsNotificationConfiguration;
}
/** @resource */
export interface SubscriberNotification extends Resource<"AWS.SecurityLake.SubscriberNotification", SubscriberNotificationProps, {
    /** ID of the subscriber the notification belongs to. */
    subscriberId: string;
    /**
     * The notification endpoint — the ARN of the AWS-managed SQS queue, or
     * the configured HTTPS endpoint.
     */
    subscriberEndpoint: string | undefined;
}, never, Providers> {
}
/**
 * A Security Lake subscriber notification — notifies a data-access
 * subscriber whenever new objects land in its Security Lake bucket, either
 * via an AWS-managed SQS queue or a custom HTTPS endpoint.
 *
 * ### Notifying subscribers
 * **Example:** SQS notifications
 * ```typescript
 * const notification = yield* SecurityLake.SubscriberNotification("Notify", {
 *   subscriberId: subscriber.subscriberId,
 *   sqs: true,
 * });
 * ```
 *
 * **Example:** HTTPS notifications with an API key
 * ```typescript
 * const notification = yield* SecurityLake.SubscriberNotification("Notify", {
 *   subscriberId: subscriber.subscriberId,
 *   httpsNotificationConfiguration: {
 *     endpoint: "https://ingest.example.com/securitylake",
 *     targetRoleArn: eventsRole.roleArn,
 *     authorizationApiKeyName: "x-api-key",
 *     authorizationApiKeyValue: Redacted.make("super-secret"),
 *   },
 * });
 * ```
 */
declare const SubscriberNotificationResource: import("../../Resource.ts").ResourceClass<SubscriberNotification>;
export { SubscriberNotificationResource as SubscriberNotification };
export declare const SubscriberNotificationProvider: () => import("effect/Layer").Layer<Provider.Provider<SubscriberNotification>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=SubscriberNotification.d.ts.map