import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
import type { DeviceDefaultProfile } from "./DefaultProfile.ts";
declare const TypeId: "Cloudflare.Devices.CustomProfile";
type TypeId = typeof TypeId;
/**
 * Configuration for a WARP custom device profile.
 *
 * A custom profile applies its settings to the subset of devices matched
 * by the `match` wirefilter expression, evaluated in ascending
 * `precedence` order. Devices not matched by any custom profile fall back
 * to the account's default profile.
 */
export interface DeviceCustomProfileProps {
    /**
     * Name of the device settings profile. If omitted, a unique name is
     * generated from the app, stage, and logical ID.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * The wirefilter expression to match devices, e.g.
     * `identity.email == "user@example.com"` or `os.name == "windows"`.
     * Mutable — patched in place.
     */
    match: string;
    /**
     * The precedence of the profile. Lower values indicate higher
     * precedence; profiles are evaluated in ascending order. Must be
     * unique within the account.
     */
    precedence: number;
    /**
     * Whether the profile is applied to matching devices.
     * @default true
     */
    enabled?: boolean;
    /**
     * A human-readable description of the profile.
     */
    description?: string;
    /**
     * Routes that WARP will tunnel for matched devices. Mutually exclusive
     * with {@link exclude}. Pushed to the per-profile include list endpoint.
     */
    include?: DeviceDefaultProfile.SplitTunnelEntry[];
    /**
     * Routes that WARP will bypass for matched devices. Mutually exclusive
     * with {@link include}. Pushed to the per-profile exclude list endpoint.
     */
    exclude?: DeviceDefaultProfile.SplitTunnelEntry[];
    /**
     * Local-fallback DNS suffixes for matched devices. For each suffix,
     * WARP resolves matching names via the given DNS servers.
     */
    fallbackDomains?: DeviceDefaultProfile.FallbackDomain[];
    /**
     * Seconds to wait before activating the captive-portal bypass. A value
     * of `0` disables the bypass.
     */
    captivePortal?: number;
    /**
     * Seconds to wait before WARP reconnects after the user disables it.
     * `0` keeps WARP disabled until the user re-enables it.
     */
    autoConnect?: number;
    /**
     * Whether the user is allowed to remove the device from the team.
     */
    allowedToLeave?: boolean;
    /**
     * Whether the user is allowed to switch WARP between Gateway-with-WARP
     * and other modes.
     */
    allowModeSwitch?: boolean;
    /**
     * Whether WARP should surface available client updates to the user.
     */
    allowUpdates?: boolean;
    /**
     * When `true`, fallback domains without an explicit `dnsServer` are NOT
     * resolved via the system resolver — WARP refuses to resolve them.
     */
    disableAutoFallback?: boolean;
    /**
     * When `true`, Microsoft 365 service IP ranges are added to the
     * split-tunnel exclude list automatically.
     */
    excludeOfficeIps?: boolean;
    /**
     * When `true`, the user cannot turn the WARP switch off.
     */
    switchLocked?: boolean;
    /**
     * Selects WARP's tunneling behavior: `"warp"` for the full WireGuard
     * tunnel, `"proxy"` for a local SOCKS proxy on the chosen `port`.
     */
    serviceModeV2?: DeviceDefaultProfile.ServiceModeV2;
    /**
     * Minutes of LAN access permitted after a WARP reconnect. `0` means
     * unrestricted until the next WARP cycle.
     */
    lanAllowMinutes?: number;
    /**
     * Prefix length of the LAN subnet that {@link lanAllowMinutes} applies
     * to (e.g. `24` for a `/24`).
     */
    lanAllowSubnetSize?: number;
    /**
     * When `true`, the OS registers WARP's local interface IP with the
     * on-premises DNS server.
     */
    registerInterfaceIpWithDns?: boolean;
    /**
     * When `true`, WARP signals SCCM that the device is inside a VPN
     * boundary. Windows only.
     */
    sccmVpnBoundarySupport?: boolean;
    /**
     * URL launched when the user clicks "Send Feedback" in the client.
     */
    supportUrl?: string;
    /**
     * Which underlying tunnel protocol WARP should use (e.g. `"wireguard"`,
     * `"masque"`).
     */
    tunnelProtocol?: string;
}
export type DeviceCustomProfileAttributes = {
    /** API UUID of the profile. */
    policyId: string;
    /** Account that owns the profile. */
    accountId: string;
    /** Observed profile name. */
    name: string;
    /** Observed wirefilter match expression. */
    match: string | undefined;
    /** Observed precedence. */
    precedence: number | undefined;
    /** Whether the profile is applied to matching devices. */
    enabled: boolean | undefined;
    /** Observed description. */
    description: string | undefined;
    /** Always `false` — custom profiles are never the default profile. */
    default: boolean;
    /** Observed per-profile split-tunnel include list. */
    include: DeviceDefaultProfile.SplitTunnelEntry[];
    /** Observed per-profile split-tunnel exclude list. */
    exclude: DeviceDefaultProfile.SplitTunnelEntry[];
    /** Observed per-profile fallback domains. */
    fallbackDomains: DeviceDefaultProfile.FallbackDomain[];
    /** Observed captive-portal timeout (seconds). */
    captivePortal: number | undefined;
    /** Observed auto-connect timeout (seconds). */
    autoConnect: number | undefined;
    /** Whether devices are allowed to leave the organization. */
    allowedToLeave: boolean | undefined;
    /** Whether the user may switch WARP modes. */
    allowModeSwitch: boolean | undefined;
    /** Whether update notifications are shown. */
    allowUpdates: boolean | undefined;
    /** Whether auto-fallback to system DNS is disabled. */
    disableAutoFallback: boolean | undefined;
    /** Whether Microsoft IPs are auto-excluded. */
    excludeOfficeIps: boolean | undefined;
    /** Whether the WARP switch is locked on. */
    switchLocked: boolean | undefined;
    /** Tunneling mode configuration. */
    serviceModeV2: DeviceDefaultProfile.ServiceModeV2 | undefined;
    /** Whether the WARP IP is registered with the on-prem DNS server. */
    registerInterfaceIpWithDns: boolean | undefined;
    /** Whether SCCM VPN-boundary support is enabled. */
    sccmVpnBoundarySupport: boolean | undefined;
    /** Send-Feedback URL. */
    supportUrl: string | undefined;
    /** Tunnel protocol selection. */
    tunnelProtocol: string | undefined;
};
export type DeviceCustomProfile = Resource<TypeId, DeviceCustomProfileProps, DeviceCustomProfileAttributes, never, Providers>;
/**
 * A Cloudflare WARP **custom device profile** — a settings profile applied
 * to the subset of devices matched by a wirefilter `match` expression at a
 * given `precedence`.
 *
 * All properties are mutable in place: the profile itself is patched, and
 * the per-profile split-tunnel include/exclude and fallback-domain lists
 * are replaced via their dedicated endpoints. Deleting the resource
 * deletes the profile; matched devices fall back to the account's default
 * profile.
 * ### Creating a profile
 * **Example:** Profile for a user group
 * ```typescript
 * const profile = yield* Cloudflare.Devices.DeviceCustomProfile("Contractors", {
 *   match: 'identity.groups.name == "contractors"',
 *   precedence: 100,
 *   description: "Locked-down profile for contractors",
 *   switchLocked: true,
 * });
 * ```
 *
 * ### Split tunneling
 * **Example:** Exclude internal ranges from the tunnel
 * ```typescript
 * yield* Cloudflare.Devices.DeviceCustomProfile("Engineering", {
 *   match: 'identity.groups.name == "engineering"',
 *   precedence: 50,
 *   exclude: [
 *     { address: "10.0.0.0/8", description: "RFC1918" },
 *   ],
 * });
 * ```
 *
 * ### Fallback domains
 * **Example:** Resolve a private suffix via an on-prem DNS server
 * ```typescript
 * yield* Cloudflare.Devices.DeviceCustomProfile("CorpDns", {
 *   match: 'identity.email matches ".*@corp.example.com"',
 *   precedence: 10,
 *   fallbackDomains: [
 *     { suffix: "corp.example.com", dnsServer: ["10.0.0.53"] },
 *   ],
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cloudflare-one/connections/connect-devices/warp/configure-warp/device-profiles/
 *
 * @resource
 * @product Devices
 * @category Cloudflare One (Zero Trust)
 */
export declare const DeviceCustomProfile: import("../../Resource.ts").ResourceClass<DeviceCustomProfile>;
/**
 * Returns true if the given value is a DeviceCustomProfile resource.
 */
export declare const isDeviceCustomProfile: (value: unknown) => value is DeviceCustomProfile;
export declare const DeviceCustomProfileProvider: () => import("effect/Layer").Layer<Provider.Provider<DeviceCustomProfile>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | zeroTrust.CloudflareOpContext>;
export {};
//# sourceMappingURL=CustomProfile.d.ts.map