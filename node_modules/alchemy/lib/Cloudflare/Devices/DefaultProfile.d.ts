import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
/**
 * Configuration for the singleton WARP default device profile.
 *
 * Every Cloudflare Zero Trust account has exactly one default device
 * profile that applies to all WARP devices not matched by a custom
 * profile. This shape mirrors the fields supported by
 * `PATCH /accounts/{accountId}/devices/policy` plus the three list
 * endpoints for the split-tunnel include/exclude and fallback domains.
 */
export interface DeviceDefaultProfileProps {
    /**
     * Split-tunnel mode. `"include"` routes only listed CIDRs/hostnames
     * through WARP; `"exclude"` routes everything except listed entries.
     *
     * The Cloudflare backend stores the include and exclude lists
     * independently — only the list matching the active mode is enforced
     * at runtime. We always push both lists when supplied so toggling
     * `mode` is non-destructive.
     *
     * @default "exclude"
     */
    mode?: "include" | "exclude";
    /**
     * Routes that WARP will tunnel. Only effective when {@link mode} is
     * `"include"`. Pushed to `PUT /devices/policy/include`.
     */
    splitTunnelInclude?: DeviceDefaultProfile.SplitTunnelEntry[];
    /**
     * Routes that WARP will bypass. Only effective when {@link mode} is
     * `"exclude"`. Pushed to `PUT /devices/policy/exclude`.
     */
    splitTunnelExclude?: DeviceDefaultProfile.SplitTunnelEntry[];
    /**
     * Local-fallback DNS suffixes. For each suffix, WARP will resolve
     * matching names via the given DNS servers (or the system resolver
     * when omitted and {@link disableAutoFallback} is `false`).
     */
    fallbackDomains?: DeviceDefaultProfile.FallbackDomain[];
    /**
     * Seconds to wait before activating the captive-portal bypass. A
     * value of `0` disables the bypass.
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
     * When `true`, fallback domains without an explicit `dnsServer` are
     * NOT resolved via the system resolver — WARP refuses to resolve them.
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
     * Selects WARP's tunneling behavior:
     * - `"warp"` — full WireGuard tunnel
     * - `"proxy"` — local SOCKS proxy on the chosen `port`
     */
    serviceModeV2?: DeviceDefaultProfile.ServiceModeV2;
    /**
     * Minutes of LAN access permitted after a WARP reconnect. `0` means
     * unrestricted until the next WARP cycle.
     */
    lanAllowMinutes?: number;
    /**
     * Prefix length of the LAN subnet that {@link lanAllowMinutes}
     * applies to (e.g. `24` for a `/24`).
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
export declare namespace DeviceDefaultProfile {
    /**
     * One entry in either the split-tunnel include or exclude list.
     * Either an `address` (CIDR) or a `host` (DNS name) is required.
     */
    interface SplitTunnelEntry {
        /** CIDR-form route, e.g. `"10.0.0.0/8"` or `"1.2.3.4/32"`. */
        address: string;
        /** Hostname-form route, e.g. `"example.com"`. */
        host?: string;
        /** Free-form description shown in the dashboard. */
        description?: string;
    }
    /**
     * Local-fallback DNS configuration for a given DNS suffix.
     */
    interface FallbackDomain {
        /** DNS suffix, e.g. `"corp.example.com"`. */
        suffix: string;
        /** Optional free-form description. */
        description?: string;
        /** DNS resolvers (IPv4/IPv6) used for names matching `suffix`. */
        dnsServer?: string[];
    }
    /**
     * Tunneling-mode configuration.
     */
    interface ServiceModeV2 {
        /** `"warp"` for the full WireGuard tunnel, `"proxy"` for SOCKS. */
        mode: "warp" | "proxy";
        /** Local SOCKS port when `mode === "proxy"`. Ignored otherwise. */
        port?: number;
    }
}
export type DeviceDefaultProfile = Resource<"Cloudflare.Devices.DefaultProfile", DeviceDefaultProfileProps, {
    /** Account that owns the default profile. */
    accountId: string;
    /** Observed split-tunnel mode. */
    mode: "include" | "exclude";
    /** Observed include list. */
    splitTunnelInclude: DeviceDefaultProfile.SplitTunnelEntry[];
    /** Observed exclude list. */
    splitTunnelExclude: DeviceDefaultProfile.SplitTunnelEntry[];
    /** Observed fallback domains. */
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
    /** LAN-access allowance (minutes). */
    lanAllowMinutes: number | undefined;
    /** LAN subnet prefix length. */
    lanAllowSubnetSize: number | undefined;
    /** Whether the WARP IP is registered with the on-prem DNS server. */
    registerInterfaceIpWithDns: boolean | undefined;
    /** Whether SCCM VPN-boundary support is enabled. */
    sccmVpnBoundarySupport: boolean | undefined;
    /** Send-Feedback URL. */
    supportUrl: string | undefined;
    /** Tunnel protocol selection. */
    tunnelProtocol: string | undefined;
}, never, Providers>;
/**
 * Manages the **singleton** Cloudflare WARP **default device profile** for
 * an account. The default profile applies to every WARP device not
 * matched by a custom profile.
 * @remarks
 * There is exactly one default profile per account; it cannot be created
 * or deleted. Reconciling this resource patches the existing profile in
 * place and synchronizes the four sibling list endpoints (include,
 * exclude, fallback domains). The `delete` lifecycle is a deliberate
 * no-op — destroying the Alchemy resource only removes our local state,
 * the cloud profile remains intact.
 *
 * Custom (non-default) profiles are a separate resource.
 *
 * ### Configuring split tunneling
 * **Example:** Exclude-mode (default): tunnel everything except listed routes
 * ```typescript
 * yield* Cloudflare.Devices.DeviceDefaultProfile("Default", {
 *   mode: "exclude",
 *   splitTunnelExclude: [
 *     { address: "10.0.0.0/8", description: "RFC1918" },
 *     { address: "192.168.0.0/16", description: "RFC1918" },
 *   ],
 *   excludeOfficeIps: true,
 * });
 * ```
 *
 * **Example:** Include-mode: only listed routes go through WARP
 * ```typescript
 * yield* Cloudflare.Devices.DeviceDefaultProfile("Default", {
 *   mode: "include",
 *   splitTunnelInclude: [
 *     { address: "10.42.0.0/16", description: "Prod VPC" },
 *   ],
 * });
 * ```
 *
 * ### Configuring fallback domains
 * **Example:** Resolve a private suffix via an on-prem DNS server
 * ```typescript
 * yield* Cloudflare.Devices.DeviceDefaultProfile("Default", {
 *   fallbackDomains: [
 *     {
 *       suffix: "corp.example.com",
 *       dnsServer: ["10.0.0.53"],
 *       description: "Corp AD",
 *     },
 *   ],
 *   disableAutoFallback: true,
 * });
 * ```
 *
 * @resource
 * @product Devices
 * @category Cloudflare One (Zero Trust)
 */
export declare const DeviceDefaultProfile: import("../../Resource.ts").ResourceClass<DeviceDefaultProfile>;
/**
 * Live `Provider` for {@link DeviceDefaultProfile}. Wire into a Cloudflare
 * provider Layer with `Provider.collection([DeviceDefaultProfile])` plus
 * `DeviceDefaultProfileProvider()`.
 */
export declare const DeviceDefaultProfileProvider: () => import("effect/Layer").Layer<Provider.Provider<DeviceDefaultProfile>, never, CloudflareEnvironment | zeroTrust.CloudflareOpContext>;
//# sourceMappingURL=DefaultProfile.d.ts.map