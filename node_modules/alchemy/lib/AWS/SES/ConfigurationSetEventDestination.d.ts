import type * as sesv2Types from "@distilled.cloud/aws/sesv2";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * The email-sending events an event destination can match, e.g. `SEND`,
 * `DELIVERY`, `BOUNCE`, `COMPLAINT`, `OPEN`, `CLICK`.
 */
export type EventType = sesv2Types.EventType;
export interface CloudWatchDimensionConfiguration {
    /**
     * The name of the CloudWatch dimension, e.g. `ses:configuration-set`.
     */
    dimensionName: string;
    /**
     * Where SES reads the dimension value from: a message tag
     * (`MESSAGE_TAG`), an email header (`EMAIL_HEADER`), or a link tag
     * (`LINK_TAG`).
     */
    dimensionValueSource: sesv2Types.DimensionValueSource;
    /**
     * The value SES publishes when the message doesn't carry the tag/header.
     */
    defaultDimensionValue: string;
}
export interface ConfigurationSetEventDestinationProps {
    /**
     * The name of the configuration set that owns this event destination.
     * Changing it replaces the destination.
     */
    configurationSetName: string;
    /**
     * The name of the event destination. If omitted, a deterministic physical
     * name is generated from the app, stage, and logical ID. Changing the
     * name replaces the destination.
     */
    eventDestinationName?: string;
    /**
     * Whether the event destination is active.
     * @default true
     */
    enabled?: boolean;
    /**
     * The event types to publish to the destination, e.g.
     * `["SEND", "DELIVERY", "BOUNCE", "COMPLAINT"]`.
     */
    matchingEventTypes: EventType[];
    /**
     * Publish events to an SNS topic.
     */
    snsDestination?: {
        /** The ARN of the SNS topic to publish events to. */
        topicArn: string;
    };
    /**
     * Publish events to an EventBridge event bus (the default bus only).
     */
    eventBridgeDestination?: {
        /** The ARN of the EventBridge event bus (must be the default bus). */
        eventBusArn: string;
    };
    /**
     * Publish event metrics to CloudWatch.
     */
    cloudWatchDestination?: {
        /** How SES maps message tags/headers to CloudWatch dimensions. */
        dimensionConfigurations: CloudWatchDimensionConfiguration[];
    };
}
export interface ConfigurationSetEventDestination extends Resource<"AWS.SES.ConfigurationSetEventDestination", ConfigurationSetEventDestinationProps, {
    configurationSetName: string;
    eventDestinationName: string;
}, never, Providers> {
}
/**
 * An event destination on an SES v2 configuration set — streams
 * send/delivery/bounce/complaint (and open/click) events to SNS,
 * EventBridge, or CloudWatch.
 * ### Creating Event Destinations
 * **Example:** Publish Bounce and Complaint Events to SNS
 * ```typescript
 * import * as SES from "alchemy/AWS/SES";
 * import * as SNS from "alchemy/AWS/SNS";
 *
 * const topic = yield* SNS.Topic("EmailEvents", {});
 * const configSet = yield* SES.ConfigurationSet("Default", {});
 *
 * const destination = yield* SES.ConfigurationSetEventDestination("ToSns", {
 *   configurationSetName: configSet.configurationSetName,
 *   matchingEventTypes: ["BOUNCE", "COMPLAINT"],
 *   snsDestination: { topicArn: topic.topicArn },
 * });
 * ```
 *
 * **Example:** Publish Metrics to CloudWatch
 * ```typescript
 * const metrics = yield* SES.ConfigurationSetEventDestination("Metrics", {
 *   configurationSetName: configSet.configurationSetName,
 *   matchingEventTypes: ["SEND", "DELIVERY"],
 *   cloudWatchDestination: {
 *     dimensionConfigurations: [
 *       {
 *         dimensionName: "campaign",
 *         dimensionValueSource: "MESSAGE_TAG",
 *         defaultDimensionValue: "none",
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const ConfigurationSetEventDestination: import("../../Resource.ts").ResourceClass<ConfigurationSetEventDestination>;
export declare const ConfigurationSetEventDestinationProvider: () => import("effect/Layer").Layer<Provider.Provider<ConfigurationSetEventDestination>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ConfigurationSetEventDestination.d.ts.map