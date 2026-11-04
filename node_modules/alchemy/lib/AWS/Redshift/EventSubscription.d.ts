import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/**
 * The kind of Redshift resource an {@link EventSubscription} filters on.
 */
export type EventSubscriptionSourceType = "cluster" | "cluster-parameter-group" | "cluster-security-group" | "cluster-snapshot" | "scheduled-action";
/**
 * Redshift event categories an {@link EventSubscription} can filter on.
 */
export type EventSubscriptionCategory = "configuration" | "management" | "monitoring" | "security" | "pending";
export interface EventSubscriptionProps {
    /**
     * Name of the event subscription. Must be 1-255 ASCII letters, digits or
     * hyphens, starting with a letter, and must not end with a hyphen or
     * contain two consecutive hyphens. If omitted, a deterministic physical
     * name is generated. Changing the name replaces the subscription.
     */
    subscriptionName?: string;
    /**
     * ARN of the SNS topic Redshift publishes matching events to. The topic
     * must exist and allow Redshift to publish.
     */
    snsTopicArn: string;
    /**
     * The kind of source to filter on (e.g. `"cluster"`). Required when
     * `sourceIds` is set.
     * @default all source types
     */
    sourceType?: EventSubscriptionSourceType;
    /**
     * Identifiers of the specific sources to filter on (e.g. cluster
     * identifiers when `sourceType` is `"cluster"`).
     * @default all sources of the subscribed type
     */
    sourceIds?: string[];
    /**
     * Event categories to subscribe to (e.g. `["monitoring", "management"]`).
     * @default all categories
     */
    eventCategories?: EventSubscriptionCategory[];
    /**
     * Only deliver events of this severity.
     * @default both `ERROR` and `INFO`
     */
    severity?: "ERROR" | "INFO";
    /**
     * Whether event delivery is active.
     * @default true
     */
    enabled?: boolean;
    /**
     * User-defined tags for the event subscription.
     */
    tags?: Record<string, string>;
}
export interface EventSubscription extends Resource<"AWS.Redshift.EventSubscription", EventSubscriptionProps, {
    /**
     * Name of the event subscription.
     */
    subscriptionName: string;
    /**
     * ARN of the event subscription.
     */
    eventSubscriptionArn: string;
    /**
     * ARN of the SNS topic events are delivered to.
     */
    snsTopicArn: string | undefined;
    /**
     * Status of the subscription (`"active"`, or `"no-permission"` /
     * `"topic-not-exist"` when the SNS topic became unreachable after
     * creation).
     */
    status: string | undefined;
    /**
     * The source type filter, if any.
     */
    sourceType: string | undefined;
    /**
     * The source identifier filters, if any.
     */
    sourceIds: string[];
    /**
     * The event category filters, if any.
     */
    eventCategories: string[];
    /**
     * The severity filter, if any.
     */
    severity: string | undefined;
    /**
     * Whether event delivery is active.
     */
    enabled: boolean | undefined;
    /**
     * Tags on the event subscription (including internal Alchemy tags).
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon Redshift event notification subscription — routes provisioned
 * cluster lifecycle events (maintenance, resizes, snapshots, failures,
 * security changes) to an SNS topic.
 *
 * SNS is Redshift's native event channel for provisioned clusters: the only
 * events Redshift publishes *directly* to EventBridge are the zero-ETL
 * integration detail-types, so cluster events reach compute through an
 * `EventSubscription` → `SNS.Topic` → `SNS.consumeTopicNotifications` chain.
 * Subscriptions are free and provision instantly.
 * ### Subscribing to Cluster Events
 * **Example:** Route Cluster Events to an SNS Topic
 * ```typescript
 * const alerts = yield* SNS.Topic("WarehouseAlerts", {});
 * const subscription = yield* Redshift.EventSubscription("WarehouseEvents", {
 *   snsTopicArn: alerts.topicArn,
 *   sourceType: "cluster",
 *   sourceIds: [cluster.clusterIdentifier],
 * });
 * ```
 * **Example:** Only Error-Severity Monitoring Events
 * ```typescript
 * const subscription = yield* Redshift.EventSubscription("WarehouseErrors", {
 *   snsTopicArn: alerts.topicArn,
 *   eventCategories: ["monitoring"],
 *   severity: "ERROR",
 * });
 * ```
 * **Example:** Consume the Events in a Function
 * ```typescript
 * // inside a Lambda Function definition:
 * yield* SNS.consumeTopicNotifications(alerts, (messages) =>
 *   Stream.runForEach(messages, (message) =>
 *     Effect.logInfo(`redshift event: ${message.Message}`),
 *   ),
 * );
 * ```
 *
 * @resource
 */
export declare const EventSubscription: import("../../Resource.ts").ResourceClass<EventSubscription>;
export declare const EventSubscriptionProvider: () => import("effect/Layer").Layer<Provider.Provider<EventSubscription>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=EventSubscription.d.ts.map