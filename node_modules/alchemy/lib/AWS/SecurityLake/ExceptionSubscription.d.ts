import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ExceptionSubscriptionProps {
    /**
     * The protocol used to notify the subscription endpoint, e.g. `email`,
     * `sqs`, or `https`.
     */
    subscriptionProtocol: string;
    /**
     * The endpoint Security Lake delivers exception notifications to (an email
     * address, SQS queue ARN, or HTTPS endpoint, matching the protocol).
     */
    notificationEndpoint: string;
    /**
     * How long unresolved exceptions are retained before expiring. Accepts any
     * `Duration.Input` (e.g. `"30 days"`, `Duration.days(30)`; a bare number is
     * milliseconds); the wire unit is whole days.
     * @default - exceptions do not expire
     */
    exceptionTimeToLive?: Duration.Input;
}
/** @resource */
export interface ExceptionSubscription extends Resource<"AWS.SecurityLake.ExceptionSubscription", ExceptionSubscriptionProps, {
    /** The protocol used to notify the subscription endpoint. */
    subscriptionProtocol: string;
    /** The endpoint that receives exception notifications. */
    notificationEndpoint: string;
    /** Retention of unresolved exceptions, in whole days. */
    exceptionTimeToLive: number | undefined;
}, never, Providers> {
}
/**
 * The Amazon Security Lake exception notification subscription — an
 * account-Region singleton that delivers notifications (via SNS protocols
 * like email, SQS, or HTTPS) whenever Security Lake hits an exception it
 * cannot resolve automatically.
 *
 * ### Subscribing to exceptions
 * **Example:** Email notifications
 * ```typescript
 * const exceptions = yield* SecurityLake.ExceptionSubscription("Exceptions", {
 *   subscriptionProtocol: "email",
 *   notificationEndpoint: "security-team@example.com",
 * });
 * ```
 *
 * **Example:** SQS notifications with a 30-day exception TTL
 * ```typescript
 * const exceptions = yield* SecurityLake.ExceptionSubscription("Exceptions", {
 *   subscriptionProtocol: "sqs",
 *   notificationEndpoint: queue.queueArn,
 *   exceptionTimeToLive: "30 days",
 * });
 * ```
 */
declare const ExceptionSubscriptionResource: import("../../Resource.ts").ResourceClass<ExceptionSubscription>;
export { ExceptionSubscriptionResource as ExceptionSubscription };
export declare const ExceptionSubscriptionProvider: () => import("effect/Layer").Layer<Provider.Provider<ExceptionSubscription>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ExceptionSubscription.d.ts.map