import * as mnm from "@distilled.cloud/cloudflare/magic-network-monitoring";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.MagicNetworkMonitoring.Config";
type TypeId = typeof TypeId;
/**
 * A WARP device registered as a flow-data source on the MNM config.
 */
export interface WarpDevice {
    /**
     * Unique identifier of the WARP device.
     */
    id: string;
    /**
     * Display name of the WARP device.
     */
    name: string;
    /**
     * IPv4 address the WARP device sends flow data from.
     */
    routerIp: string;
}
export interface ConfigProps {
    /**
     * The account name label stored on the MNM configuration. Freeform —
     * mutable in place.
     */
    name: string;
    /**
     * Fallback sampling rate of flow messages being sent in packets per
     * second. This should match the packet sampling rate configured on the
     * router. Minimum of 1. Mutable in place.
     */
    defaultSampling: number;
    /**
     * IPv4 CIDR addresses (`/32`) of the routers that send flow data to
     * Cloudflare. Registering router flow sources requires the Magic Network
     * Monitoring router-flow entitlement — accounts without it reject any
     * non-empty value with the typed `InvalidMnmConfig` error (Cloudflare
     * code 1003).
     * @default []
     */
    routerIps?: string[];
    /**
     * WARP devices registered as flow-data sources.
     * @default []
     */
    warpDevices?: WarpDevice[];
}
export interface ConfigAttributes {
    /** The Cloudflare account the configuration belongs to. */
    accountId: string;
    /** The account name label stored on the configuration. */
    name: string;
    /** Sampling rate of flow messages in packets per second. */
    defaultSampling: number;
    /** Router IPs registered as flow-data sources. */
    routerIps: string[];
    /** WARP devices registered as flow-data sources. */
    warpDevices: WarpDevice[];
}
export type Config = Resource<TypeId, ConfigProps, ConfigAttributes, never, Providers>;
/**
 * The Magic Network Monitoring (MNM) account configuration — the singleton
 * that registers your network's routers (and optionally WARP devices) as
 * flow-data sources and sets the fallback packet sampling rate.
 *
 * There is exactly one MNM configuration per Cloudflare account, and MNM
 * rules cannot be created until it exists. Creating a second configuration
 * fails (`MnmConfigAlreadyExists`), so reconcile tolerates the race by
 * falling through to an update. When the engine has no prior state but a
 * configuration already exists on the account, `read` reports it as
 * `Unowned` and takeover is gated behind `--adopt`.
 * ### Creating the configuration
 * **Example:** Minimal configuration
 * ```typescript
 * const config = yield* Cloudflare.MagicNetworkMonitoring.Config("Mnm", {
 *   name: "my-network",
 *   defaultSampling: 1,
 * });
 * ```
 *
 * **Example:** Configuration with router IPs
 * ```typescript
 * const config = yield* Cloudflare.MagicNetworkMonitoring.Config("Mnm", {
 *   name: "my-network",
 *   defaultSampling: 100,
 *   routerIps: ["203.0.113.1/32"],
 * });
 * ```
 *
 * ### Rules depend on the configuration
 * **Example:** Create the config before any rules
 * ```typescript
 * const config = yield* Cloudflare.MagicNetworkMonitoring.Config("Mnm", {
 *   name: "my-network",
 *   defaultSampling: 1,
 * });
 * // Reference an output attribute so the rule deploys after the config.
 * yield* Cloudflare.MagicNetworkMonitoring.Rule("VolumetricAlert", {
 *   accountId: config.accountId,
 *   type: "threshold",
 *   prefixes: ["10.0.0.0/24"],
 *   bandwidthThreshold: 1_000_000,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/magic-network-monitoring/
 *
 * @resource
 * @product Magic Network Monitoring
 * @category Network
 */
export declare const Config: import("../../Resource.ts").ResourceClass<Config>;
/**
 * Returns true if the given value is a Config resource.
 */
export declare const isConfig: (value: unknown) => value is Config;
export declare const ConfigProvider: () => import("effect/Layer").Layer<Provider.Provider<Config>, never, CloudflareEnvironment | mnm.CloudflareOpContext>;
export {};
//# sourceMappingURL=Config.d.ts.map