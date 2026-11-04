import * as iotw from "@distilled.cloud/aws/iot-wireless";
import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * LoRaWAN OTAA v1.1 activation keys. The root keys (`AppKey`, `NwkKey`) are
 * secrets — wrap them with `Redacted.make(...)`.
 */
export interface OtaaV1_1Props {
    /** The AppKey root key. Secret key material. */
    AppKey?: Redacted.Redacted<string>;
    /** The NwkKey root key. Secret key material. */
    NwkKey?: Redacted.Redacted<string>;
    /** The JoinEUI identifier (public). */
    JoinEui?: string;
}
/**
 * LoRaWAN OTAA v1.0.x activation keys. The root keys (`AppKey`, `GenAppKey`)
 * are secrets — wrap them with `Redacted.make(...)`.
 */
export interface OtaaV1_0_xProps {
    /** The AppKey root key. Secret key material. */
    AppKey?: Redacted.Redacted<string>;
    /** The AppEUI identifier (public). */
    AppEui?: string;
    /** The JoinEUI identifier (public). */
    JoinEui?: string;
    /** The GenAppKey root key. Secret key material. */
    GenAppKey?: Redacted.Redacted<string>;
}
/**
 * LoRaWAN ABP v1.1 session keys. All four keys are secrets — wrap them with
 * `Redacted.make(...)`.
 */
export interface SessionKeysAbpV1_1Props {
    /** The FNwkSIntKey session key. Secret key material. */
    FNwkSIntKey?: Redacted.Redacted<string>;
    /** The SNwkSIntKey session key. Secret key material. */
    SNwkSIntKey?: Redacted.Redacted<string>;
    /** The NwkSEncKey session key. Secret key material. */
    NwkSEncKey?: Redacted.Redacted<string>;
    /** The AppSKey session key. Secret key material. */
    AppSKey?: Redacted.Redacted<string>;
}
/** LoRaWAN ABP v1.1 activation configuration. */
export interface AbpV1_1Props {
    /** The device address (public). */
    DevAddr?: string;
    /** Session keys. Secret key material. */
    SessionKeys?: SessionKeysAbpV1_1Props;
    /** The initial FCnt value. */
    FCntStart?: number;
}
/**
 * LoRaWAN ABP v1.0.x session keys. Both keys are secrets — wrap them with
 * `Redacted.make(...)`.
 */
export interface SessionKeysAbpV1_0_xProps {
    /** The NwkSKey session key. Secret key material. */
    NwkSKey?: Redacted.Redacted<string>;
    /** The AppSKey session key. Secret key material. */
    AppSKey?: Redacted.Redacted<string>;
}
/** LoRaWAN ABP v1.0.x activation configuration. */
export interface AbpV1_0_xProps {
    /** The device address (public). */
    DevAddr?: string;
    /** Session keys. Secret key material. */
    SessionKeys?: SessionKeysAbpV1_0_xProps;
    /** The initial FCnt value. */
    FCntStart?: number;
}
/**
 * LoRaWAN device configuration. Mirrors the wire shape, with the activation
 * key material typed as `Redacted` so secrets never leak into logs or state
 * diffs.
 */
export interface LoRaWANDeviceProps {
    /** The DevEUI radio identifier (public). Changing it replaces the device. */
    DevEui?: string;
    /** ID of the device profile the device uses. Updates in place. */
    DeviceProfileId?: string;
    /** ID of the service profile the device uses. Updates in place. */
    ServiceProfileId?: string;
    /** OTAA v1.1 activation keys. Changing them replaces the device. */
    OtaaV1_1?: OtaaV1_1Props;
    /** OTAA v1.0.x activation keys. Changing them replaces the device. */
    OtaaV1_0_x?: OtaaV1_0_xProps;
    /** ABP v1.1 activation configuration. Changing it replaces the device. */
    AbpV1_1?: AbpV1_1Props;
    /** ABP v1.0.x activation configuration. Changing it replaces the device. */
    AbpV1_0_x?: AbpV1_0_xProps;
    /** FPort configuration. Updates in place. */
    FPorts?: iotw.FPorts;
}
export interface WirelessDeviceProps {
    /**
     * The wireless technology the device uses. Changing the type replaces the
     * device.
     */
    type: "LoRaWAN" | "Sidewalk";
    /**
     * Name of the destination that routes the device's uplink messages. Can be
     * changed in place.
     */
    destinationName: string;
    /**
     * Name of the wireless device. If omitted, a deterministic physical name
     * is generated from the app, stage, and logical ID. Can be changed in
     * place.
     */
    name?: string;
    /**
     * Human-readable description of the device.
     */
    description?: string;
    /**
     * LoRaWAN device configuration: `DevEui`, the device/service profile IDs,
     * and the activation keys (`OtaaV1_0_x`, `OtaaV1_1`, `AbpV1_0_x`,
     * `AbpV1_1`). The `DevEui` and activation keys are the device's radio
     * identity — changing them replaces the device; the profile IDs and
     * `FPorts` update in place. Key material is secret — wrap each key with
     * `Redacted.make(...)`.
     */
    loRaWAN?: LoRaWANDeviceProps;
    /**
     * Whether position solving is enabled for the device (`Enabled` or
     * `Disabled`).
     */
    positioning?: iotw.PositioningConfigStatus;
    /**
     * Amazon Sidewalk device configuration. Changing the manufacturing serial
     * number replaces the device.
     */
    sidewalk?: iotw.SidewalkCreateWirelessDevice;
    /**
     * Tags applied to the device. Alchemy ownership tags are merged in
     * automatically.
     */
    tags?: Record<string, string>;
}
export interface WirelessDevice extends Resource<"AWS.IoTWireless.WirelessDevice", WirelessDeviceProps, {
    /** Server-assigned ID of the wireless device. */
    wirelessDeviceId: string;
    /** ARN of the wireless device. */
    wirelessDeviceArn: string;
    /** Name of the wireless device. */
    wirelessDeviceName: string;
    /** The wireless technology the device uses. */
    type: iotw.WirelessDeviceType;
    /** Name of the destination routing the device's uplinks. */
    destinationName: string;
}, never, Providers> {
}
/**
 * An AWS IoT Core for LoRaWAN (or Amazon Sidewalk) wireless device — the
 * cloud registration of a physical radio, wired to a {@link Destination}
 * for uplink routing and to a {@link DeviceProfile} / {@link ServiceProfile}
 * pair for its radio parameters.
 *
 * The device's radio identity (`type`, `DevEui`, activation keys) is
 * immutable — changing it replaces the device. The name, description,
 * destination, positioning, profile references, and tags update in place.
 * ### Creating Devices
 * **Example:** OTAA v1.0.x LoRaWAN Device
 * ```typescript
 * import * as IoTWireless from "alchemy/AWS/IoTWireless";
 *
 * const device = yield* IoTWireless.WirelessDevice("Sensor", {
 *   type: "LoRaWAN",
 *   destinationName: destination.destinationName,
 *   loRaWAN: {
 *     DevEui: "1122334455667788",
 *     DeviceProfileId: deviceProfile.deviceProfileId,
 *     ServiceProfileId: serviceProfile.serviceProfileId,
 *     OtaaV1_0_x: {
 *       AppKey: Redacted.make("00112233445566778899aabbccddeeff"),
 *       AppEui: "8877665544332211",
 *     },
 *   },
 * });
 * ```
 *
 * **Example:** Repoint a device at a different destination
 * ```typescript
 * const device = yield* IoTWireless.WirelessDevice("Sensor", {
 *   type: "LoRaWAN",
 *   destinationName: otherDestination.destinationName, // updates in place
 *   loRaWAN: { ... },
 * });
 * ```
 *
 * @resource
 */
export declare const WirelessDevice: import("../../Resource.ts").ResourceClass<WirelessDevice>;
export declare const WirelessDeviceProvider: () => import("effect/Layer").Layer<Provider.Provider<WirelessDevice>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=WirelessDevice.d.ts.map