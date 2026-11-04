import * as ddos from "@distilled.cloud/cloudflare/ddos-protection";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.DdosProtection.TcpFlowProtectionFilter";
type TypeId = typeof TypeId;
/**
 * Operating mode of an Advanced TCP Protection filter: the filter applies
 * to mitigation (`enabled`), is observe-only (`monitoring`), or excluded
 * (`disabled`).
 */
export type TcpFlowProtectionFilterMode = "enabled" | "disabled" | "monitoring";
export interface TcpFlowProtectionFilterProps {
    /**
     * The filter expression selecting which traffic TCP Flow Protection sees
     * (e.g. `tcp.dstport in {443}`). Mutable — patched in place.
     */
    expression: string;
    /**
     * The mode the filter applies to: `enabled`, `disabled`, or
     * `monitoring`. Mutable — patched in place.
     */
    mode: TcpFlowProtectionFilterMode;
}
export interface TcpFlowProtectionFilterAttributes {
    /** Cloudflare-assigned identifier of the filter. */
    filterId: string;
    /** The Cloudflare account the filter belongs to. */
    accountId: string;
    /** The filter expression. */
    expression: string;
    /** The mode the filter applies to. */
    mode: TcpFlowProtectionFilterMode;
    /** ISO8601 creation timestamp. */
    createdOn: string;
    /** ISO8601 last-modified timestamp. */
    modifiedOn: string;
}
export type TcpFlowProtectionFilter = Resource<TypeId, TcpFlowProtectionFilterProps, TcpFlowProtectionFilterAttributes, never, Providers>;
/**
 * An Advanced TCP Protection TCP Flow Protection filter (Magic Transit).
 *
 * Filters gate which traffic the TCP Flow Protection rules see, per mode:
 * an `enabled` filter scopes mitigation, a `monitoring` filter scopes
 * observe-only analysis, and a `disabled` filter excludes traffic. Both
 * `expression` and `mode` are mutable in place.
 *
 * Requires the **Magic Transit / Advanced TCP Protection** entitlement; on
 * accounts without it every API call fails with the typed
 * `AdvancedTcpProtectionNotEntitled` error.
 *
 * Safety: filters carry no ownership markers. When there is no prior
 * state, `read` scans for an existing filter with the same expression and
 * reports it as `Unowned`, so the engine refuses to take it over unless
 * `--adopt` (or `adopt(true)`) is set.
 * ### Creating a filter
 * **Example:** Scope flow mitigation to HTTPS traffic
 * ```typescript
 * const filter = yield* Cloudflare.DdosProtection.TcpFlowProtectionFilter("HttpsOnly", {
 *   expression: "tcp.dstport in {443}",
 *   mode: "enabled",
 * });
 * ```
 *
 * **Example:** Exclude a trusted source port
 * ```typescript
 * yield* Cloudflare.DdosProtection.TcpFlowProtectionFilter("SkipBgp", {
 *   expression: "tcp.srcport in {179}",
 *   mode: "disabled",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/ddos-protection/advanced-ddos-systems/overview/advanced-tcp-protection/
 *
 * @resource
 * @product DDoS Protection
 * @category Network
 */
export declare const TcpFlowProtectionFilter: import("../../Resource.ts").ResourceClass<TcpFlowProtectionFilter>;
/**
 * Returns true if the given value is a TcpFlowProtectionFilter resource.
 */
export declare const isTcpFlowProtectionFilter: (value: unknown) => value is TcpFlowProtectionFilter;
export declare const TcpFlowProtectionFilterProvider: () => import("effect/Layer").Layer<Provider.Provider<TcpFlowProtectionFilter>, never, CloudflareEnvironment | ddos.CloudflareOpContext>;
export {};
//# sourceMappingURL=TcpFlowProtectionFilter.d.ts.map