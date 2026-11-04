import * as iotw from "@distilled.cloud/aws/iot-wireless";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface DeviceProfileProps {
    /**
     * Name of the device profile. If omitted, a deterministic physical name
     * is generated from the app, stage, and logical ID. Device profiles are
     * immutable — changing the name replaces the profile.
     */
    name?: string;
    /**
     * LoRaWAN device profile configuration (MAC version, regional parameters,
     * RX windows, class B/C support). Immutable — changing any field replaces
     * the profile.
     */
    loRaWAN?: iotw.LoRaWANDeviceProfile;
    /**
     * Sidewalk device profile configuration. Set to `{}` to create an Amazon
     * Sidewalk device profile instead of a LoRaWAN one. Immutable.
     */
    sidewalk?: iotw.SidewalkCreateDeviceProfile;
    /**
     * Tags applied to the device profile. Alchemy ownership tags are merged
     * in automatically.
     */
    tags?: Record<string, string>;
}
export interface DeviceProfile extends Resource<"AWS.IoTWireless.DeviceProfile", DeviceProfileProps, {
    /** Server-assigned ID of the device profile. */
    deviceProfileId: string;
    /** ARN of the device profile. */
    deviceProfileArn: string;
    /** Name of the device profile. */
    deviceProfileName: string;
}, never, Providers> {
}
/**
 * An AWS IoT Core for LoRaWAN device profile — the hardware-level LoRaWAN
 * parameters (MAC version, regional band, RX windows, device classes) shared
 * by devices of the same model.
 *
 * Device profiles are immutable after creation: any change to `name`,
 * `loRaWAN`, or `sidewalk` replaces the profile. Only tags update in place.
 * ### Creating Device Profiles
 * **Example:** US915 OTAA Device Profile
 * ```typescript
 * import * as IoTWireless from "alchemy/AWS/IoTWireless";
 *
 * const profile = yield* IoTWireless.DeviceProfile("SensorModel", {
 *   loRaWAN: {
 *     MacVersion: "1.0.3",
 *     RegParamsRevision: "RP002-1.0.1",
 *     RfRegion: "US915",
 *     MaxEirp: 10,
 *     SupportsJoin: true,
 *   },
 * });
 * ```
 *
 * **Example:** Sidewalk Device Profile
 * ```typescript
 * const profile = yield* IoTWireless.DeviceProfile("SidewalkModel", {
 *   sidewalk: {},
 * });
 * ```
 *
 * @resource
 */
export declare const DeviceProfile: import("../../Resource.ts").ResourceClass<DeviceProfile>;
export declare const DeviceProfileProvider: () => import("effect/Layer").Layer<Provider.Provider<DeviceProfile>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=DeviceProfile.d.ts.map