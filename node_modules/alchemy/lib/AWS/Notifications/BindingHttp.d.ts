import * as Effect from "effect/Effect";
import type { NotificationConfiguration } from "./NotificationConfiguration.ts";
/**
 * Shared HTTP scaffolding for the AWS User Notifications runtime bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the builders
 * below. Everything except the operation, the IAM action, and (for the
 * configuration-scoped builder) the injected ARN is boilerplate.
 *
 * User Notifications is a global service managed from `us-east-1` (other
 * regions reject management calls), so every operation is resolved with the
 * Region pinned via {@link pinNotificationsRegion} — exactly like the
 * resource providers in `internal.ts`.
 *
 * Per the `notifications` service authorization reference, the event/read
 * query actions authorize on event/configuration ARN patterns that are not
 * known until runtime, so the account-level builder grants on
 * `Resource: ["*"]`. `notifications:ListChannels` authorizes on the
 * notification configuration, so the configuration-scoped builder grants on
 * the bound configuration's ARN.
 */
/**
 * Build the impl Effect for an account-level User Notifications operation
 * (the notification-event and managed-notification read APIs — none of
 * which are scoped to a caller-owned resource).
 */
export declare const makeNotificationsHttpBinding: <I extends object, A, E, R>(options: {
    /**
     * Short capability name used in the binding sid and runtime span, e.g.
     * `"ListNotificationEvents"`.
     */
    capability: string;
    /** IAM actions granted on `Resource: ["*"]`. */
    iamActions: readonly string[];
    /** The distilled operation implementing the capability. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, Exclude<R, import("@distilled.cloud/aws/Region").Region>>;
/**
 * Build the impl Effect for an operation scoped to one
 * {@link NotificationConfiguration}. The runtime callable injects the bound
 * configuration's ARN as the request's `notificationConfigurationArn`; the
 * deploy-time half grants `iamActions` on the configuration's ARN.
 */
export declare const makeNotificationConfigurationHttpBinding: <I extends {
    notificationConfigurationArn?: string;
}, A, E, R>(options: {
    /**
     * Short capability name used in the binding sid and runtime span, e.g.
     * `"ListChannels"`.
     */
    capability: string;
    /** IAM actions granted on the configuration ARN. */
    iamActions: readonly string[];
    /** The distilled operation; `notificationConfigurationArn` is injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
}) => Effect.Effect<(configuration: NotificationConfiguration) => Effect.Effect<(request?: Omit<I, "notificationConfigurationArn"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, Exclude<R, import("@distilled.cloud/aws/Region").Region>>;
//# sourceMappingURL=BindingHttp.d.ts.map