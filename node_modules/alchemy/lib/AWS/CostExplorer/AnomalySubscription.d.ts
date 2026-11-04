import * as ce from "@distilled.cloud/aws/cost-explorer";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * A subscriber notified when a monitored anomaly crosses the subscription's
 * threshold.
 */
export interface AnomalySubscriber {
    /**
     * The destination — an email address (for `EMAIL`) or an SNS topic ARN
     * (for `SNS`).
     */
    address: string;
    /**
     * How the subscriber is notified. `IMMEDIATE` frequency requires `SNS`
     * subscribers; `DAILY`/`WEEKLY` require `EMAIL`.
     */
    type: "EMAIL" | "SNS" | (string & {});
}
export interface AnomalySubscriptionProps {
    /**
     * Name of the subscription. If omitted, a unique name is generated from
     * the app, stage, and logical ID. Renaming updates the subscription in
     * place.
     */
    subscriptionName?: string;
    /**
     * ARNs of the anomaly monitors this subscription listens to. Pass
     * `monitor.monitorArn` outputs from {@link AnomalyMonitor} resources.
     */
    monitorArnList: string[];
    /**
     * Who gets notified when an anomaly crosses the threshold.
     */
    subscribers: AnomalySubscriber[];
    /**
     * How often notifications are sent. `IMMEDIATE` requires SNS subscribers;
     * `DAILY` and `WEEKLY` send email digests.
     */
    frequency: "DAILY" | "IMMEDIATE" | "WEEKLY" | (string & {});
    /**
     * An expression gating notifications on anomaly impact — e.g. only alert
     * when the total absolute impact exceeds $100:
     * `{ Dimensions: { Key: "ANOMALY_TOTAL_IMPACT_ABSOLUTE", MatchOptions: ["GREATER_THAN_OR_EQUAL"], Values: ["100"] } }`
     * (raw Cost Explorer `Expression` shape).
     */
    thresholdExpression?: ce.Expression;
    /**
     * User-defined tags to apply to the subscription.
     */
    tags?: Record<string, string>;
}
export interface AnomalySubscription extends Resource<"AWS.CostExplorer.AnomalySubscription", AnomalySubscriptionProps, {
    /** ARN of the anomaly subscription. */
    subscriptionArn: string;
    /** Name of the anomaly subscription. */
    subscriptionName: string;
    /** Account ID the subscription belongs to. */
    accountId: string | undefined;
    /** Current tags on the subscription. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * A Cost Explorer anomaly alert subscription. Attaches email or SNS
 * subscribers to one or more {@link AnomalyMonitor}s with a notification
 * frequency and an impact threshold.
 *
 * Cost Explorer is a global service — all calls are pinned to `us-east-1`
 * regardless of the stack region. Every property is mutable in place.
 *
 * ### Creating Anomaly Subscriptions
 * **Example:** Daily email digest for anomalies over $100
 * ```typescript
 * import * as CostExplorer from "alchemy/AWS/CostExplorer";
 *
 * const monitor = yield* CostExplorer.AnomalyMonitor("ServiceSpend", {
 *   monitorType: "DIMENSIONAL",
 *   monitorDimension: "SERVICE",
 * });
 *
 * const subscription = yield* CostExplorer.AnomalySubscription("Alerts", {
 *   monitorArnList: [monitor.monitorArn],
 *   frequency: "DAILY",
 *   subscribers: [{ type: "EMAIL", address: "team@example.com" }],
 *   thresholdExpression: {
 *     Dimensions: {
 *       Key: "ANOMALY_TOTAL_IMPACT_ABSOLUTE",
 *       MatchOptions: ["GREATER_THAN_OR_EQUAL"],
 *       Values: ["100"],
 *     },
 *   },
 * });
 * ```
 *
 * **Example:** Immediate SNS notifications
 * ```typescript
 * const subscription = yield* CostExplorer.AnomalySubscription("PagerFeed", {
 *   monitorArnList: [monitor.monitorArn],
 *   frequency: "IMMEDIATE",
 *   subscribers: [{ type: "SNS", address: topic.topicArn }],
 * });
 * ```
 *
 * @resource
 */
export declare const AnomalySubscription: import("../../Resource.ts").ResourceClass<AnomalySubscription>;
export declare const AnomalySubscriptionProvider: () => import("effect/Layer").Layer<Provider.Provider<AnomalySubscription>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=AnomalySubscription.d.ts.map