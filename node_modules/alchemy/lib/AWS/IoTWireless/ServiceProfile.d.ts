import * as iotw from "@distilled.cloud/aws/iot-wireless";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ServiceProfileProps {
    /**
     * Name of the service profile. If omitted, a deterministic physical name
     * is generated from the app, stage, and logical ID. Service profiles are
     * immutable — changing the name replaces the profile.
     */
    name?: string;
    /**
     * LoRaWAN service profile configuration (data-rate bounds, gateway
     * metadata, roaming flags, transmission counts). Immutable — changing any
     * field replaces the profile.
     */
    loRaWAN?: iotw.LoRaWANServiceProfile;
    /**
     * Tags applied to the service profile. Alchemy ownership tags are merged
     * in automatically.
     */
    tags?: Record<string, string>;
}
export interface ServiceProfile extends Resource<"AWS.IoTWireless.ServiceProfile", ServiceProfileProps, {
    /** Server-assigned ID of the service profile. */
    serviceProfileId: string;
    /** ARN of the service profile. */
    serviceProfileArn: string;
    /** Name of the service profile. */
    serviceProfileName: string;
}, never, Providers> {
}
/**
 * An AWS IoT Core for LoRaWAN service profile — the network-level parameters
 * (data-rate bounds, gateway metadata reporting, roaming permissions) shared
 * by a fleet of wireless devices.
 *
 * Service profiles are immutable after creation: any change to `name` or
 * `loRaWAN` replaces the profile. Only tags update in place.
 * ### Creating Service Profiles
 * **Example:** Default Service Profile
 * ```typescript
 * import * as IoTWireless from "alchemy/AWS/IoTWireless";
 *
 * const profile = yield* IoTWireless.ServiceProfile("Fleet");
 * ```
 *
 * **Example:** Service Profile with Gateway Metadata
 * ```typescript
 * const profile = yield* IoTWireless.ServiceProfile("Fleet", {
 *   loRaWAN: { AddGwMetadata: true, DrMin: 0, DrMax: 10 },
 *   tags: { team: "iot" },
 * });
 * ```
 *
 * ### Referencing from Devices
 * **Example:** Wire a device to the profile
 * ```typescript
 * const device = yield* IoTWireless.WirelessDevice("Sensor", {
 *   type: "LoRaWAN",
 *   destinationName: destination.destinationName,
 *   loRaWAN: {
 *     DevEui: "1122334455667788",
 *     ServiceProfileId: profile.serviceProfileId,
 *     DeviceProfileId: deviceProfile.deviceProfileId,
 *     OtaaV1_0_x: { AppKey: "...", AppEui: "..." },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const ServiceProfile: import("../../Resource.ts").ResourceClass<ServiceProfile>;
export declare const ServiceProfileProvider: () => import("effect/Layer").Layer<Provider.Provider<ServiceProfile>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ServiceProfile.d.ts.map