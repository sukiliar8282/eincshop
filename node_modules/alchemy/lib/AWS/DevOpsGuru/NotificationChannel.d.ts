import * as devopsguru from "@distilled.cloud/aws/devops-guru";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface NotificationChannelProps {
    /**
     * ARN of the Amazon SNS topic DevOps Guru sends notifications to. DevOps
     * Guru only supports standard (non-FIFO) topics and adds the required
     * topic policy on your behalf for same-account topics. Changing the topic
     * replaces the channel.
     */
    topicArn: string;
    /**
     * Insight severities to be notified about. When omitted, notifications are
     * sent for all severities.
     * @default all severities
     */
    severities?: devopsguru.InsightSeverity[];
    /**
     * Notification message types to receive (e.g. `NEW_INSIGHT`,
     * `CLOSED_INSIGHT`, `SEVERITY_UPGRADED`). When omitted, all message types
     * are sent.
     * @default all message types
     */
    messageTypes?: devopsguru.NotificationMessageType[];
}
export interface NotificationChannel extends Resource<"AWS.DevOpsGuru.NotificationChannel", NotificationChannelProps, {
    /** ID of the notification channel. */
    id: string;
    /** ARN of the SNS topic the channel notifies. */
    topicArn: string;
}, never, Providers> {
}
/**
 * A DevOps Guru notification channel — an Amazon SNS topic that DevOps Guru
 * uses to notify you when insights are generated, closed, or change severity.
 *
 * The channel configuration is immutable in the AWS API: changing the topic
 * replaces the channel, while filter changes are converged in place by
 * removing and re-adding the channel (the channel `id` attribute changes).
 *
 * ### Creating a Notification Channel
 * **Example:** Notify an SNS topic about all insights
 * ```typescript
 * const topic = yield* SNS.Topic("Alerts", {});
 *
 * const channel = yield* DevOpsGuru.NotificationChannel("Channel", {
 *   topicArn: topic.topicArn,
 * });
 * ```
 *
 * **Example:** Filter to high-severity new insights
 * ```typescript
 * const channel = yield* DevOpsGuru.NotificationChannel("Channel", {
 *   topicArn: topic.topicArn,
 *   severities: ["HIGH"],
 *   messageTypes: ["NEW_INSIGHT", "SEVERITY_UPGRADED"],
 * });
 * ```
 *
 * @resource
 */
export declare const NotificationChannel: import("../../Resource.ts").ResourceClass<NotificationChannel>;
export declare const NotificationChannelProvider: () => import("effect/Layer").Layer<Provider.Provider<NotificationChannel>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=NotificationChannel.d.ts.map