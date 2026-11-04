import * as addressing from "@distilled.cloud/cloudflare/addressing";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Addressing.BgpPrefix";
type TypeId = typeof TypeId;
export interface BgpPrefixProps {
    /**
     * Identifier of the parent BYOIP prefix the BGP prefix belongs to.
     * Changing it forces a replacement.
     */
    prefixId: string;
    /**
     * IP Prefix in Classless Inter-Domain Routing format. Must be contained
     * in the parent prefix. Changing it forces a replacement.
     */
    cidr: string;
    /**
     * Whether the BGP prefix is advertised to the internet (maps to
     * `on_demand.advertised`). Mutable — patched in place; BGP propagation
     * is eventually consistent (minutes).
     * @default false
     */
    advertised?: boolean;
    /**
     * Number of times to prepend the Cloudflare ASN to the BGP AS-Path
     * attribute. Mutable.
     */
    asnPrependCount?: number;
    /**
     * If `true`, Cloudflare advertises the prefix only while a matching BGP
     * prefix exists in the Magic routing table, automatically withdrawing it
     * otherwise. Mutable.
     */
    autoAdvertiseWithdraw?: boolean;
}
export interface BgpPrefixAttributes {
    /** Cloudflare-assigned identifier of the BGP prefix. */
    bgpPrefixId: string;
    /** Identifier of the parent BYOIP prefix. */
    prefixId: string;
    /** The Cloudflare account the prefix belongs to. */
    accountId: string;
    /** IP Prefix in CIDR format. */
    cidr: string;
    /** ASN the prefix is advertised under. */
    asn: number | undefined;
    /** Number of Cloudflare ASN prepends on the AS-Path attribute. */
    asnPrependCount: number | undefined;
    /** Whether Cloudflare auto-withdraws the prefix without a Magic route. */
    autoAdvertiseWithdraw: boolean | undefined;
    /** On-demand advertisement state for the BGP prefix. */
    onDemand: {
        /** Whether the prefix is currently advertised. */
        advertised: boolean;
        /** When the advertisement state last changed. */
        advertisedModifiedAt: string | undefined;
        /** Whether on-demand advertisement is enabled for the prefix. */
        onDemandEnabled: boolean;
        /** `true` while an advertisement change is propagating. */
        onDemandLocked: boolean;
    };
    /** ISO8601 creation timestamp. */
    createdAt: string | undefined;
    /** ISO8601 last-modified timestamp. */
    modifiedAt: string | undefined;
}
export type BgpPrefix = Resource<TypeId, BgpPrefixProps, BgpPrefixAttributes, never, Providers>;
/**
 * A BGP prefix controlling on-demand advertisement of a BYOIP prefix (or a
 * subnet of it) to the internet.
 *
 * Cloudflare automatically creates BGP prefixes during BYOIP onboarding, so
 * reconcile adopts an existing BGP prefix matching the CIDR before creating
 * a new one. There is **no delete API** — destroying this resource only
 * withdraws the advertisement (`advertised: false`) and drops the state.
 * ### Advertising a Prefix
 * **Example:** Advertise the whole BYOIP prefix
 * ```typescript
 * const bgp = yield* Cloudflare.Addressing.BgpPrefix("advertise", {
 *   prefixId: prefix.prefixId,
 *   cidr: prefix.cidr,
 *   advertised: true,
 * });
 * ```
 *
 * **Example:** Withdraw with AS-Path prepending configured
 * ```typescript
 * const bgp = yield* Cloudflare.Addressing.BgpPrefix("advertise", {
 *   prefixId: prefix.prefixId,
 *   cidr: prefix.cidr,
 *   advertised: false,
 *   asnPrependCount: 2,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/byoip/concepts/bgp-prefixes/
 *
 * @resource
 * @product Addressing
 * @category Network
 */
export declare const BgpPrefix: import("../../Resource.ts").ResourceClass<BgpPrefix>;
/**
 * Returns true if the given value is an BgpPrefix resource.
 */
export declare const isBgpPrefix: (value: unknown) => value is BgpPrefix;
export declare const BgpPrefixProvider: () => import("effect/Layer").Layer<Provider.Provider<BgpPrefix>, never, CloudflareEnvironment | addressing.CloudflareOpContext>;
export {};
//# sourceMappingURL=BgpPrefix.d.ts.map