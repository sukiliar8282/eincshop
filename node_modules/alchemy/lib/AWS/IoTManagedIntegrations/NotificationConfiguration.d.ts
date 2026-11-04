import * as mi from "@distilled.cloud/aws/iot-managed-integrations";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export interface NotificationConfigurationProps {
    /**
     * Event type to route, e.g. `DEVICE_STATE`, `DEVICE_LIFE_CYCLE`,
     * `DEVICE_EVENT`, `DEVICE_COMMAND_REQUEST`, `DEVICE_OTA`,
     * `CONNECTOR_ASSOCIATION`, `ACCOUNT_ASSOCIATION`,
     * `CONNECTOR_ERROR_REPORT`. The event type is the configuration's
     * identifier — at most one configuration exists per event type, and
     * changing it replaces the configuration.
     */
    eventType: mi.EventType;
    /**
     * Name of the {@link Destination} that receives events of this type.
     */
    destinationName: string;
    /**
     * User-defined tags to apply to the notification configuration.
     */
    tags?: Record<string, string>;
}
export interface NotificationConfiguration extends Resource<"AWS.IoTManagedIntegrations.NotificationConfiguration", NotificationConfigurationProps, {
    /** Event type routed by this configuration (its identifier). */
    eventType: mi.EventType;
    /** Name of the destination that receives the events. */
    destinationName: string;
    /** Constructed ARN of the notification configuration. */
    notificationConfigurationArn: string;
    /** Tags applied to the notification configuration (user + internal). */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An AWS IoT Managed Integrations notification configuration — routes one
 * event type (device state, lifecycle, OTA, discovery, association events)
 * to a {@link Destination}.
 *
 * Managed integrations has no direct Lambda invocation path: events flow
 * `NotificationConfiguration -> Destination -> Kinesis Data Stream`, so pair
 * this resource with a Kinesis-backed destination and consume the stream
 * with the Kinesis stream event source (`Kinesis.consumeStreamRecords`).
 *
 * IoT Managed Integrations is a regional service available in a limited set
 * of regions (e.g. `eu-west-1`, `ca-central-1`).
 *
 * ### Routing Events
 * **Example:** Route Device State Events to a Kinesis Destination
 * ```typescript
 * const destination = yield* Destination("EventDestination", {
 *   deliveryDestinationArn: stream.streamArn,
 *   roleArn: role.roleArn,
 * });
 * const routing = yield* NotificationConfiguration("DeviceState", {
 *   eventType: "DEVICE_STATE",
 *   destinationName: destination.destinationName,
 * });
 * ```
 *
 * **Example:** Route Lifecycle Events with Tags
 * ```typescript
 * const routing = yield* NotificationConfiguration("Lifecycle", {
 *   eventType: "DEVICE_LIFE_CYCLE",
 *   destinationName: destination.destinationName,
 *   tags: { team: "iot" },
 * });
 * ```
 *
 * @resource
 */
export declare const NotificationConfiguration: import("../../Resource.ts").ResourceClass<NotificationConfiguration>;
export declare const NotificationConfigurationProvider: () => import("effect/Layer").Layer<Provider.Provider<NotificationConfiguration>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=NotificationConfiguration.d.ts.map