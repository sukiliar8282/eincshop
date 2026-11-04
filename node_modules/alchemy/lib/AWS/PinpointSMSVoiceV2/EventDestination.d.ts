import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface CloudWatchLogsDestinationProps {
    /**
     * ARN of an IAM role that End User Messaging SMS assumes to write to
     * the log group. The role must trust `sms-voice.amazonaws.com`.
     */
    iamRoleArn: string;
    /**
     * ARN of the CloudWatch Logs log group that receives the events.
     */
    logGroupArn: string;
}
export interface KinesisFirehoseDestinationProps {
    /**
     * ARN of an IAM role that End User Messaging SMS assumes to put
     * records on the delivery stream. The role must trust
     * `sms-voice.amazonaws.com`.
     */
    iamRoleArn: string;
    /**
     * ARN of the Kinesis Data Firehose delivery stream that receives the
     * events.
     */
    deliveryStreamArn: string;
}
export interface SnsDestinationProps {
    /**
     * ARN of the SNS topic that receives the events.
     */
    topicArn: string;
}
export interface EventDestinationProps {
    /**
     * Name of the configuration set the event destination is attached to.
     * Changing it replaces the event destination.
     */
    configurationSetName: string;
    /**
     * Name of the event destination (`[A-Za-z0-9_-]+`, 1-64 characters).
     * Changing the name replaces the event destination.
     * @default ${app}-${stage}-${id}
     */
    eventDestinationName?: string;
    /**
     * The message event types the destination receives, e.g. `ALL`,
     * `TEXT_ALL`, `TEXT_SENT`, `TEXT_DELIVERED`, `VOICE_ALL`.
     */
    matchingEventTypes: string[];
    /**
     * Whether the event destination is enabled. Disabled destinations
     * receive no events.
     * @default true
     */
    enabled?: boolean;
    /**
     * Deliver events to a CloudWatch Logs log group. Exactly one of
     * `cloudWatchLogsDestination`, `kinesisFirehoseDestination`, or
     * `snsDestination` must be set.
     */
    cloudWatchLogsDestination?: CloudWatchLogsDestinationProps;
    /**
     * Deliver events to a Kinesis Data Firehose delivery stream. Exactly
     * one of `cloudWatchLogsDestination`, `kinesisFirehoseDestination`, or
     * `snsDestination` must be set.
     */
    kinesisFirehoseDestination?: KinesisFirehoseDestinationProps;
    /**
     * Deliver events to an SNS topic. Exactly one of
     * `cloudWatchLogsDestination`, `kinesisFirehoseDestination`, or
     * `snsDestination` must be set.
     */
    snsDestination?: SnsDestinationProps;
}
export interface EventDestination extends Resource<"AWS.PinpointSMSVoiceV2.EventDestination", EventDestinationProps, {
    /**
     * Configuration set the destination belongs to.
     */
    configurationSetName: string;
    /**
     * ARN of the owning configuration set.
     */
    configurationSetArn: string;
    /**
     * Name of the event destination.
     */
    eventDestinationName: string;
    /**
     * Whether event delivery is enabled.
     */
    enabled: boolean;
    /**
     * Event types routed to the destination (e.g. `ALL`, `TEXT_DELIVERED`).
     */
    matchingEventTypes: string[];
}, never, Providers> {
}
/**
 * An AWS End User Messaging SMS (Pinpoint SMS Voice v2) event
 * destination — routes message events (sends, deliveries, failures) from
 * a `ConfigurationSet` to CloudWatch Logs, Kinesis Data Firehose, or SNS.
 *
 * Each configuration set holds up to five event destinations; each event
 * destination references exactly one delivery target.
 * ### Creating Event Destinations
 * **Example:** Stream all events to SNS
 * ```typescript
 * import * as PinpointSMSVoiceV2 from "alchemy/AWS/PinpointSMSVoiceV2";
 * import * as SNS from "alchemy/AWS/SNS";
 *
 * const configSet = yield* PinpointSMSVoiceV2.ConfigurationSet("Messaging");
 * const events = yield* SNS.Topic("SmsEvents");
 * const destination = yield* PinpointSMSVoiceV2.EventDestination("Events", {
 *   configurationSetName: configSet.configurationSetName,
 *   matchingEventTypes: ["ALL"],
 *   snsDestination: { topicArn: events.topicArn },
 * });
 * ```
 *
 * **Example:** CloudWatch Logs destination
 * ```typescript
 * const destination = yield* PinpointSMSVoiceV2.EventDestination("Logs", {
 *   configurationSetName: configSet.configurationSetName,
 *   matchingEventTypes: ["TEXT_ALL"],
 *   cloudWatchLogsDestination: {
 *     iamRoleArn: role.roleArn,
 *     logGroupArn: logGroup.logGroupArn,
 *   },
 * });
 * ```
 *
 * **Example:** Disable a destination without deleting it
 * ```typescript
 * const destination = yield* PinpointSMSVoiceV2.EventDestination("Events", {
 *   configurationSetName: configSet.configurationSetName,
 *   matchingEventTypes: ["ALL"],
 *   snsDestination: { topicArn: events.topicArn },
 *   enabled: false,
 * });
 * ```
 *
 * @resource
 */
export declare const EventDestination: import("../../Resource.ts").ResourceClass<EventDestination>;
declare const SmsVoiceEventDestinationMissing_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SmsVoiceEventDestinationMissing";
} & Readonly<A>;
/**
 * Raised when an event destination cannot be observed immediately after
 * it was created — the create call succeeded (or raced a peer) but the
 * follow-up describe found nothing.
 */
export declare class SmsVoiceEventDestinationMissing extends SmsVoiceEventDestinationMissing_base<{
    message: string;
}> {
}
export declare const EventDestinationProvider: () => import("effect/Layer").Layer<Provider.Provider<EventDestination>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=EventDestination.d.ts.map