import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface EventRuleProps {
    /**
     * The ARN of the {@link NotificationConfiguration} this rule feeds.
     * Changing the configuration replaces the rule.
     */
    notificationConfigurationArn: string;
    /**
     * The EventBridge event source, e.g. `aws.s3`, `aws.cloudwatch`,
     * `aws.ec2`. Changing the source replaces the rule.
     */
    source: string;
    /**
     * The event type emitted by the source, e.g. `Object Created`,
     * `CloudWatch Alarm State Change`, `EC2 Instance State-change
     * Notification`. Changing the event type replaces the rule.
     */
    eventType: string;
    /**
     * Optional EventBridge event pattern that further restricts which events
     * match. Provided as a JSON string or a plain pattern object. When
     * omitted, all events of `source`/`eventType` match.
     */
    eventPattern?: string | Record<string, any>;
    /**
     * The AWS regions whose events this rule captures. User Notifications
     * creates a managed EventBridge rule in each listed region.
     */
    regions: string[];
}
export interface EventRule extends Resource<"AWS.Notifications.EventRule", EventRuleProps, {
    /** The ARN of the event rule. */
    eventRuleArn: string;
    /** The ARN of the parent notification configuration. */
    notificationConfigurationArn: string;
    /** The EventBridge event source. */
    source: string;
    /** The event type. */
    eventType: string;
    /** The regions whose events the rule captures. */
    regions: string[];
}, never, Providers> {
}
/**
 * An AWS User Notifications **event rule** — attaches an EventBridge
 * source/event-type (optionally narrowed by an event pattern) to a
 * {@link NotificationConfiguration}, across one or more regions.
 *
 * `source`, `eventType` and the parent configuration are immutable
 * (changing them replaces the rule); `eventPattern` and `regions` update
 * in place. User Notifications materializes a managed EventBridge rule in
 * every listed region.
 *
 * ### Creating an Event Rule
 * **Example:** Notify on S3 object creation
 * ```typescript
 * import * as Notifications from "alchemy/AWS/Notifications";
 *
 * const config = yield* Notifications.NotificationConfiguration("Alerts");
 * const rule = yield* Notifications.EventRule("S3Created", {
 *   notificationConfigurationArn: config.notificationConfigurationArn,
 *   source: "aws.s3",
 *   eventType: "Object Created",
 *   regions: ["us-west-2"],
 * });
 * ```
 *
 * **Example:** Restrict matches with an event pattern
 * ```typescript
 * const rule = yield* Notifications.EventRule("BucketRule", {
 *   notificationConfigurationArn: config.notificationConfigurationArn,
 *   source: "aws.s3",
 *   eventType: "Object Created",
 *   eventPattern: { detail: { bucket: { name: ["my-bucket"] } } },
 *   regions: ["us-west-2", "us-east-2"],
 * });
 * ```
 *
 * @resource
 */
export declare const EventRule: import("../../Resource.ts").ResourceClass<EventRule>;
export declare const EventRuleProvider: () => import("effect/Layer").Layer<Provider.Provider<EventRule>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=EventRule.d.ts.map