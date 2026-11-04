import * as alerting from "@distilled.cloud/cloudflare/alerting";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Alerting.NotificationPolicy";
type TypeId = typeof TypeId;
/**
 * The event that triggers a notification dispatch. The full catalog (and
 * which types your plan can use) is returned by the available-alerts
 * endpoint. The union is kept open so new Cloudflare alert types aren't
 * blocked by stale types.
 */
export type AlertType = alerting.CreatePolicyRequest["alertType"];
/**
 * Optional filters restricting which events trigger the policy. Which keys
 * are valid (or required — Cloudflare returns `FiltersRequired`) depends on
 * the alert type.
 */
export type NotificationPolicyFilters = alerting.CreatePolicyRequest["filters"];
/**
 * Destinations notified when the policy fires. At least one mechanism is
 * required (Cloudflare returns `MechanismRequired` otherwise). Email ids
 * are email addresses; webhook/pagerduty ids reference destination UUIDs.
 */
export interface NotificationPolicyMechanisms {
    /** Email destinations — `id` is the recipient email address. */
    email?: ReadonlyArray<{
        id: string;
    }>;
    /** Webhook destinations — `id` references a {@link NotificationWebhook}. */
    webhooks?: ReadonlyArray<{
        id: string;
    }>;
    /** PagerDuty destinations — `id` references a connected PagerDuty service. */
    pagerduty?: ReadonlyArray<{
        id: string;
    }>;
}
export interface NotificationPolicyProps {
    /**
     * Name of the policy. If omitted, a unique name is generated.
     * Mutable — renames are applied in place.
     * @default ${app}-${id}-${stage}-${suffix}
     */
    name?: string;
    /**
     * The event that triggers a notification dispatch (e.g.
     * `universal_ssl_event_type`, `billing_usage_alert`). Changing the alert
     * type triggers a replacement: the valid filter set depends on the alert
     * type, so a policy alerting on a different event is a different policy.
     */
    alertType: AlertType;
    /**
     * Whether the policy is enabled.
     * @default true
     */
    enabled?: boolean;
    /**
     * Optional human-readable description of the policy.
     */
    description?: string;
    /**
     * How often to re-alert from the same incident (e.g. `"30m"`). Not
     * supported by all alert types.
     */
    alertInterval?: string;
    /**
     * Destinations notified when the policy fires. At least one mechanism
     * is required.
     */
    mechanisms: NotificationPolicyMechanisms;
    /**
     * Optional filters restricting which events trigger the policy. Some
     * alert types require specific filters (`FiltersRequired`).
     */
    filters?: NotificationPolicyFilters;
}
export interface NotificationPolicyAttributes {
    /** Cloudflare-assigned notification policy UUID. */
    policyId: string;
    /** Account that owns this policy. */
    accountId: string;
    /** Name of the policy. */
    name: string;
    /** The alert type the policy fires on. */
    alertType: AlertType;
    /** Whether the policy is enabled. */
    enabled: boolean;
    /** ISO8601 creation timestamp. */
    created: string | undefined;
    /** ISO8601 last-modified timestamp. */
    modified: string | undefined;
}
export type NotificationPolicy = Resource<TypeId, NotificationPolicyProps, NotificationPolicyAttributes, never, Providers>;
/**
 * A Cloudflare Notifications policy.
 *
 * A notification policy connects an alert type (the event Cloudflare
 * watches for) to one or more destinations — email addresses, webhook
 * destinations, or PagerDuty services — optionally narrowed by filters.
 * ### Creating a policy
 * **Example:** Email notifications for Universal SSL events
 * ```typescript
 * yield* Cloudflare.Alerting.NotificationPolicy("SslAlerts", {
 *   alertType: "universal_ssl_event_type",
 *   mechanisms: { email: [{ id: "ops@example.com" }] },
 * });
 * ```
 *
 * **Example:** Disabled policy with a description
 * ```typescript
 * yield* Cloudflare.Alerting.NotificationPolicy("SslAlerts", {
 *   alertType: "universal_ssl_event_type",
 *   enabled: false,
 *   description: "Paused during migration",
 *   mechanisms: { email: [{ id: "ops@example.com" }] },
 * });
 * ```
 *
 * ### Webhook destinations
 * **Example:** Dispatch to a webhook destination
 * ```typescript
 * const webhook = yield* Cloudflare.Alerting.NotificationWebhook("AlertsHook", {
 *   url: "https://alerts.example.com/cf",
 * });
 *
 * yield* Cloudflare.Alerting.NotificationPolicy("SslAlerts", {
 *   alertType: "universal_ssl_event_type",
 *   mechanisms: { webhooks: [{ id: webhook.webhookId }] },
 * });
 * ```
 *
 * ### Filters
 * **Example:** Health check alerts for specific zones
 * ```typescript
 * yield* Cloudflare.Alerting.NotificationPolicy("HealthAlerts", {
 *   alertType: "health_check_status_notification",
 *   mechanisms: { email: [{ id: "ops@example.com" }] },
 *   filters: {
 *     healthCheckId: [healthCheckId],
 *     newHealth: ["Unhealthy"],
 *   },
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/notifications/
 *
 * @resource
 * @product Alerting
 * @category Observability & Analytics
 */
export declare const NotificationPolicy: import("../../Resource.ts").ResourceClass<NotificationPolicy>;
/**
 * Returns true if the given value is a NotificationPolicy resource.
 */
export declare const isNotificationPolicy: (value: unknown) => value is NotificationPolicy;
export declare const NotificationPolicyProvider: () => import("effect/Layer").Layer<Provider.Provider<NotificationPolicy>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | alerting.CloudflareOpContext>;
export {};
//# sourceMappingURL=NotificationPolicy.d.ts.map