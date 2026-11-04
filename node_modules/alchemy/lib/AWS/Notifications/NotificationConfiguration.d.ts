import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * How long User Notifications aggregates events of the same kind into a
 * single notification before delivering it.
 */
export type AggregationDuration = "LONG" | "SHORT" | "NONE";
export interface NotificationConfigurationProps {
    /**
     * Name of the notification configuration. Must be unique in the account
     * (letters, numbers, underscores and hyphens). If omitted, a unique name
     * is generated from the app, stage and logical ID. The name can be
     * changed in place (no replacement).
     */
    name?: string;
    /**
     * Human-readable description of the configuration.
     * @default "Managed by Alchemy"
     */
    description?: string;
    /**
     * How long to aggregate matching events into a single notification:
     * `LONG` (12 hours), `SHORT` (5 minutes) or `NONE` (no aggregation).
     * @default "NONE"
     */
    aggregationDuration?: AggregationDuration;
    /**
     * User tags to attach to the configuration. Merged with internal
     * Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface NotificationConfiguration extends Resource<"AWS.Notifications.NotificationConfiguration", NotificationConfigurationProps, {
    /** The ARN of the notification configuration (regionless). */
    notificationConfigurationArn: string;
    /** The unique name of the configuration. */
    name: string;
    /** The description of the configuration. */
    description: string;
    /**
     * Current status: `ACTIVE`, `PARTIALLY_ACTIVE`, `INACTIVE` (no event
     * rules / channels associated yet) or `DELETING`.
     */
    status: string;
}, never, Providers> {
}
/**
 * An AWS User Notifications **notification configuration** — the container
 * that groups {@link EventRule}s (which events to notify on) and delivery
 * channels (where notifications go: Console bell, email contacts, chat).
 *
 * User Notifications is a global service managed from `us-east-1`; the
 * provider pins the control-plane region automatically, so the resource
 * works from a stack deployed in any region.
 *
 * ### Creating a Notification Configuration
 * **Example:** Basic configuration
 * ```typescript
 * import * as Notifications from "alchemy/AWS/Notifications";
 *
 * const config = yield* Notifications.NotificationConfiguration("Alerts", {
 *   description: "Deployment alerts",
 * });
 * ```
 *
 * **Example:** Aggregate duplicate events for 5 minutes
 * ```typescript
 * const config = yield* Notifications.NotificationConfiguration("Alerts", {
 *   description: "Deployment alerts",
 *   aggregationDuration: "SHORT",
 *   tags: { team: "platform" },
 * });
 * ```
 *
 * ### Adding Event Rules
 * **Example:** Notify on CloudWatch alarm state changes
 * ```typescript
 * const rule = yield* Notifications.EventRule("AlarmRule", {
 *   notificationConfigurationArn: config.notificationConfigurationArn,
 *   source: "aws.cloudwatch",
 *   eventType: "CloudWatch Alarm State Change",
 *   regions: ["us-west-2"],
 * });
 * ```
 *
 * @resource
 */
export declare const NotificationConfiguration: import("../../Resource.ts").ResourceClass<NotificationConfiguration>;
export declare const NotificationConfigurationProvider: () => import("effect/Layer").Layer<Provider.Provider<NotificationConfiguration>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=NotificationConfiguration.d.ts.map