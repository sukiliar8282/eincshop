import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Devices.ManagedNetwork";
type TypeId = typeof TypeId;
/**
 * Detection configuration for a managed network: the WARP client opens a
 * TLS connection to `tlsSockaddr` and (optionally) verifies the
 * certificate's SHA-256 fingerprint to decide whether the device is on
 * the network.
 */
export interface DeviceManagedNetworkConfig {
    /**
     * A network address of the form `host:port` that the WARP client will
     * probe over TLS to detect the network (e.g. `"192.0.2.1:443"`).
     */
    tlsSockaddr: string;
    /**
     * The SHA-256 fingerprint (64 hexadecimal characters) of the TLS
     * certificate served at {@link tlsSockaddr}. When set, the client only
     * considers the network detected if the certificate matches.
     */
    sha256?: string;
}
export interface DeviceManagedNetworkProps {
    /**
     * Name of the managed network. Must be unique within the account. If
     * omitted, a unique name is generated from the app, stage, and logical
     * ID.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * TLS detection endpoint for the network. Mutable — updated in place.
     */
    config: DeviceManagedNetworkConfig;
}
export type DeviceManagedNetworkAttributes = {
    /** API UUID of the managed network. */
    networkId: string;
    /** Account that owns the managed network. */
    accountId: string;
    /** Observed network name. */
    name: string;
    /** The type of managed network — always `tls`. */
    type: "tls";
    /** Observed TLS detection configuration. */
    config: DeviceManagedNetworkConfig;
};
export type DeviceManagedNetwork = Resource<TypeId, DeviceManagedNetworkProps, DeviceManagedNetworkAttributes, never, Providers>;
/**
 * A Cloudflare Zero Trust **device managed network** — a TLS endpoint the
 * WARP client probes to detect whether the device is on a known network.
 * Device profiles can then `match` on `network` to apply different WARP
 * settings on trusted networks.
 *
 * Name and config are mutable in place (PUT). `tls` is the only network
 * type Cloudflare supports.
 * ### Creating a managed network
 * **Example:** Detect the office network by TLS fingerprint
 * ```typescript
 * const network = yield* Cloudflare.Devices.DeviceManagedNetwork("Office", {
 *   config: {
 *     tlsSockaddr: "192.0.2.1:443",
 *     sha256:
 *       "b5bb9d8014a0f9b1d61e21e796d78dccdf1352f23cd32812f4850b878ae4944c",
 *   },
 * });
 * ```
 *
 * **Example:** Use the network in a custom device profile
 * ```typescript
 * yield* Cloudflare.Devices.DeviceCustomProfile("OnPrem", {
 *   match: `network == "${network.name}"`,
 *   precedence: 100,
 *   serviceModeV2: { mode: "proxy", port: 3000 },
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cloudflare-one/connections/connect-devices/warp/configure-warp/managed-networks/
 *
 * @resource
 * @product Devices
 * @category Cloudflare One (Zero Trust)
 */
export declare const DeviceManagedNetwork: import("../../Resource.ts").ResourceClass<DeviceManagedNetwork>;
/**
 * Returns true if the given value is a DeviceManagedNetwork resource.
 */
export declare const isDeviceManagedNetwork: (value: unknown) => value is DeviceManagedNetwork;
export declare const DeviceManagedNetworkProvider: () => import("effect/Layer").Layer<Provider.Provider<DeviceManagedNetwork>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | zeroTrust.CloudflareOpContext>;
export {};
//# sourceMappingURL=ManagedNetwork.d.ts.map