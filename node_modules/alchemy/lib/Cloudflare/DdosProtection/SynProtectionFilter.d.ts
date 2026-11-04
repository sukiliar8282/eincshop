import * as ddos from "@distilled.cloud/cloudflare/ddos-protection";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.DdosProtection.SynProtectionFilter";
type TypeId = typeof TypeId;
/**
 * Operating mode of an Advanced TCP Protection filter: the filter applies
 * to mitigation (`enabled`), is observe-only (`monitoring`), or excluded
 * (`disabled`).
 */
export type SynProtectionFilterMode = "enabled" | "disabled" | "monitoring";
export interface SynProtectionFilterProps {
    /**
     * The filter expression selecting which traffic SYN Protection sees
     * (e.g. `tcp.dstport in {443}`). Mutable — patched in place.
     */
    expression: string;
    /**
     * The mode the filter applies to: `enabled`, `disabled`, or
     * `monitoring`. Mutable — patched in place.
     */
    mode: SynProtectionFilterMode;
}
export interface SynProtectionFilterAttributes {
    /** Cloudflare-assigned identifier of the filter. */
    filterId: string;
    /** The Cloudflare account the filter belongs to. */
    accountId: string;
    /** The filter expression. */
    expression: string;
    /** The mode the filter applies to. */
    mode: SynProtectionFilterMode;
    /** ISO8601 creation timestamp. */
    createdOn: string;
    /** ISO8601 last-modified timestamp. */
    modifiedOn: string;
}
export type SynProtectionFilter = Resource<TypeId, SynProtectionFilterProps, SynProtectionFilterAttributes, never, Providers>;
/**
 * An Advanced TCP Protection SYN Protection filter (Magic Transit).
 *
 * Filters gate which traffic the SYN Protection rules see, per mode: an
 * `enabled` filter scopes mitigation, a `monitoring` filter scopes
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
 * **Example:** Scope SYN mitigation to HTTPS traffic
 * ```typescript
 * const filter = yield* Cloudflare.DdosProtection.SynProtectionFilter("HttpsOnly", {
 *   expression: "tcp.dstport in {443}",
 *   mode: "enabled",
 * });
 * ```
 *
 * **Example:** Monitor a port range without mitigating
 * ```typescript
 * yield* Cloudflare.DdosProtection.SynProtectionFilter("WatchHighPorts", {
 *   expression: "tcp.dstport in {8000..8999}",
 *   mode: "monitoring",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/ddos-protection/advanced-ddos-systems/overview/advanced-tcp-protection/
 *
 * @resource
 * @product DDoS Protection
 * @category Network
 */
export declare const SynProtectionFilter: import("../../Resource.ts").ResourceClass<SynProtectionFilter>;
/**
 * Returns true if the given value is a SynProtectionFilter resource.
 */
export declare const isSynProtectionFilter: (value: unknown) => value is SynProtectionFilter;
export declare const SynProtectionFilterProvider: () => import("effect/Layer").Layer<Provider.Provider<SynProtectionFilter>, never, CloudflareEnvironment | ddos.CloudflareOpContext>;
export {};
//# sourceMappingURL=SynProtectionFilter.d.ts.map