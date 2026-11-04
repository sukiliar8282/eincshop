import * as addressing from "@distilled.cloud/cloudflare/addressing";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Addressing.Prefix";
type TypeId = typeof TypeId;
export interface PrefixProps {
    /**
     * IP Prefix in Classless Inter-Domain Routing format (e.g.
     * `192.0.2.0/24`). Immutable — changing it forces a replacement.
     */
    cidr: string;
    /**
     * Autonomous System Number (ASN) the prefix will be advertised under.
     * Immutable — changing it forces a replacement.
     */
    asn: number;
    /**
     * Description of the prefix. The only mutable field — patched in place
     * via `patchPrefix`.
     */
    description?: string;
    /**
     * Identifier for an uploaded LOA (Letter of Authorization) document.
     * Create-only — changing it forces a replacement.
     */
    loaDocumentId?: string;
    /**
     * Whether Cloudflare is allowed to generate the LOA document on behalf of
     * the prefix owner. Create-only — changing it forces a replacement.
     * @default false
     */
    delegateLoaCreation?: boolean;
}
export interface PrefixAttributes {
    /** Cloudflare-assigned identifier of the IP Prefix. */
    prefixId: string;
    /** The Cloudflare account the prefix belongs to. */
    accountId: string;
    /** IP Prefix in CIDR format. */
    cidr: string;
    /** ASN the prefix is advertised under. */
    asn: number;
    /** Approval state of the prefix (`P` = pending, `V` = active). */
    approved: string | undefined;
    /** State of the ownership validation for the prefix. */
    ownershipValidationState: string | undefined;
    /** Token provided to demonstrate ownership of the prefix. */
    ownershipValidationToken: string | undefined;
    /** State of the IRR validation for the prefix. */
    irrValidationState: string | undefined;
    /** State of the RPKI validation for the prefix. */
    rpkiValidationState: string | undefined;
    /** Identifier of the uploaded LOA document, if any. */
    loaDocumentId: string | undefined;
    /** The prefix description, if set. */
    description: string | undefined;
    /** ISO8601 creation timestamp. */
    createdAt: string | undefined;
    /** ISO8601 last-modified timestamp. */
    modifiedAt: string | undefined;
}
export type Prefix = Resource<TypeId, PrefixProps, PrefixAttributes, never, Providers>;
/**
 * A BYOIP (Bring Your Own IP) prefix onboarded to Cloudflare's network.
 *
 * Requires the BYOIP enterprise add-on; onboarding a prefix is a contract
 * process (LOA, IRR/RPKI validation, manual approval) — `approved` flips
 * from `"P"` (pending) to `"V"` (active) on Cloudflare's side and is never
 * waited on by this resource.
 *
 * Only `description` is mutable; `cidr`, `asn`, and the LOA settings force
 * a replacement.
 * ### Creating a Prefix
 * **Example:** Onboard a prefix with a pre-uploaded LOA
 * ```typescript
 * const prefix = yield* Cloudflare.Addressing.Prefix("byoip", {
 *   cidr: "192.0.2.0/24",
 *   asn: 64496,
 *   description: "production ingress",
 *   loaDocumentId: loa.id,
 * });
 * ```
 *
 * **Example:** Delegate LOA creation to Cloudflare
 * ```typescript
 * const prefix = yield* Cloudflare.Addressing.Prefix("byoip", {
 *   cidr: "192.0.2.0/24",
 *   asn: 64496,
 *   delegateLoaCreation: true,
 * });
 * ```
 *
 * ### Advertising the Prefix
 * **Example:** Advertise via a BGP prefix
 * ```typescript
 * const bgp = yield* Cloudflare.Addressing.BgpPrefix("advertise", {
 *   prefixId: prefix.prefixId,
 *   cidr: prefix.cidr,
 *   advertised: true,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/byoip/
 *
 * @resource
 * @product Addressing
 * @category Network
 */
export declare const Prefix: import("../../Resource.ts").ResourceClass<Prefix>;
/**
 * Returns true if the given value is an Prefix resource.
 */
export declare const isPrefix: (value: unknown) => value is Prefix;
export declare const PrefixProvider: () => import("effect/Layer").Layer<Provider.Provider<Prefix>, never, CloudflareEnvironment | addressing.CloudflareOpContext>;
export {};
//# sourceMappingURL=Prefix.d.ts.map