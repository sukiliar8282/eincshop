import * as addressing from "@distilled.cloud/cloudflare/addressing";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Addressing.PrefixDelegation";
type TypeId = typeof TypeId;
export interface PrefixDelegationProps {
    /**
     * Identifier of the parent BYOIP prefix being delegated from. Changing it
     * forces a replacement.
     */
    prefixId: string;
    /**
     * IP Prefix in Classless Inter-Domain Routing format to delegate. Must be
     * contained in the parent prefix. Changing it forces a replacement.
     */
    cidr: string;
    /**
     * Identifier of the Cloudflare account the prefix is delegated to.
     * Changing it forces a replacement.
     */
    delegatedAccountId: string;
}
export interface PrefixDelegationAttributes {
    /** Cloudflare-assigned identifier of the delegation. */
    delegationId: string;
    /** Identifier of the parent BYOIP prefix. */
    prefixId: string;
    /** The Cloudflare account that owns the parent prefix. */
    accountId: string;
    /** Delegated IP Prefix in CIDR format. */
    cidr: string;
    /** The account the prefix portion is delegated to. */
    delegatedAccountId: string;
    /** ISO8601 creation timestamp. */
    createdAt: string | undefined;
}
export type PrefixDelegation = Resource<TypeId, PrefixDelegationProps, PrefixDelegationAttributes, never, Providers>;
/**
 * Delegates part of a BYOIP prefix to another Cloudflare account, allowing
 * that account to use the delegated CIDR (e.g. for its own service
 * bindings).
 *
 * Delegations are create/delete only — every prop change forces a
 * replacement.
 * ### Delegating a Prefix
 * **Example:** Delegate a /26 to another account
 * ```typescript
 * const delegation = yield* Cloudflare.Addressing.PrefixDelegation("share", {
 *   prefixId: prefix.prefixId,
 *   cidr: "192.0.2.0/26",
 *   delegatedAccountId: "023e105f4ecef8ad9ca31a8372d0c353",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/byoip/
 *
 * @resource
 * @product Addressing
 * @category Network
 */
export declare const PrefixDelegation: import("../../Resource.ts").ResourceClass<PrefixDelegation>;
/**
 * Returns true if the given value is an PrefixDelegation resource.
 */
export declare const isPrefixDelegation: (value: unknown) => value is PrefixDelegation;
export declare const PrefixDelegationProvider: () => import("effect/Layer").Layer<Provider.Provider<PrefixDelegation>, never, CloudflareEnvironment | addressing.CloudflareOpContext>;
export {};
//# sourceMappingURL=PrefixDelegation.d.ts.map