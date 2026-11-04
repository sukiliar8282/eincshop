import * as iotw from "@distilled.cloud/aws/iot-wireless";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface WirelessGatewayProps {
    /**
     * Name of the wireless gateway. If omitted, a deterministic physical name
     * is generated from the app, stage, and logical ID. Can be changed in
     * place.
     */
    name?: string;
    /**
     * Human-readable description of the gateway.
     */
    description?: string;
    /**
     * LoRaWAN gateway configuration. `GatewayEui` (the gateway's unique
     * 64-bit radio identifier) and `RfRegion` are the gateway's identity —
     * changing either replaces the gateway. `JoinEuiFilters`, `NetIdFilters`,
     * and `MaxEirp` update in place.
     */
    loRaWAN: iotw.LoRaWANGateway;
    /**
     * Tags applied to the gateway. Alchemy ownership tags are merged in
     * automatically.
     */
    tags?: Record<string, string>;
}
export interface WirelessGateway extends Resource<"AWS.IoTWireless.WirelessGateway", WirelessGatewayProps, {
    /** Server-assigned ID of the wireless gateway. */
    wirelessGatewayId: string;
    /** ARN of the wireless gateway. */
    wirelessGatewayArn: string;
    /** Name of the wireless gateway. */
    wirelessGatewayName: string;
    /** The gateway's unique 64-bit radio identifier. */
    gatewayEui: string | undefined;
}, never, Providers> {
}
/**
 * An AWS IoT Core for LoRaWAN wireless gateway — the cloud registration of
 * a physical LoRaWAN gateway (packet forwarder), keyed by its unique
 * 64-bit `GatewayEui`.
 *
 * The gateway's radio identity (`GatewayEui`, `RfRegion`, sub-bands,
 * beaconing) is immutable — changing it replaces the gateway. The name,
 * description, EUI/NetID filters, `MaxEirp`, and tags update in place.
 * ### Creating Gateways
 * **Example:** US915 Gateway
 * ```typescript
 * import * as IoTWireless from "alchemy/AWS/IoTWireless";
 *
 * const gateway = yield* IoTWireless.WirelessGateway("RooftopGw", {
 *   loRaWAN: {
 *     GatewayEui: "aa555a0000000001",
 *     RfRegion: "US915",
 *   },
 *   tags: { site: "hq" },
 * });
 * ```
 *
 * **Example:** Gateway with join filters
 * ```typescript
 * const gateway = yield* IoTWireless.WirelessGateway("RooftopGw", {
 *   loRaWAN: {
 *     GatewayEui: "aa555a0000000001",
 *     RfRegion: "US915",
 *     JoinEuiFilters: [["0000000000000001", "00000000000000ff"]],
 *     MaxEirp: 30,
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const WirelessGateway: import("../../Resource.ts").ResourceClass<WirelessGateway>;
export declare const WirelessGatewayProvider: () => import("effect/Layer").Layer<Provider.Provider<WirelessGateway>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=WirelessGateway.d.ts.map