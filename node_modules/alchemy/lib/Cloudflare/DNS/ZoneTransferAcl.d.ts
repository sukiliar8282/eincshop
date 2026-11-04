import * as dns from "@distilled.cloud/cloudflare/dns";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.DNS.ZoneTransferAcl";
type TypeId = typeof TypeId;
export interface ZoneTransferAclProps {
    /**
     * Human-readable name of the ACL. If omitted, a unique name is
     * generated from the app, stage, and logical ID.
     *
     * Mutable — updated in place (PUT).
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * Allowed IPv4/IPv6 address range of primary or secondary
     * nameservers, applied account-wide. Used to allow additional NOTIFY
     * IPs for secondary zones and IPs Cloudflare allows AXFR/IXFR
     * requests from for outgoing transfers. CIDRs are limited to a
     * maximum of /24 for IPv4 and /64 for IPv6. Note that Cloudflare
     * normalizes the range to its network address (e.g. `192.0.2.53/28`
     * becomes `192.0.2.48/28`).
     *
     * Mutable — updated in place (PUT).
     */
    ipRange: string;
}
export interface ZoneTransferAclAttributes {
    /** Identifier of the ACL. */
    aclId: string;
    /** The Cloudflare account the ACL belongs to. */
    accountId: string;
    /** Human-readable name of the ACL. */
    name: string;
    /** Allowed IP range, as normalized by Cloudflare. */
    ipRange: string;
}
export type ZoneTransferAcl = Resource<TypeId, ZoneTransferAclProps, ZoneTransferAclAttributes, never, Providers>;
/**
 * A Secondary DNS zone-transfer ACL
 * (`/accounts/{account_id}/secondary_dns/acls`) — an account-wide
 * IPv4/IPv6 range that may receive NOTIFYs for secondary zones and from
 * which Cloudflare accepts AXFR/IXFR requests for outgoing transfers.
 *
 * Requires the Secondary DNS (zone transfer) entitlement on the
 * account. Both `name` and `ipRange` are mutable in place.
 * ### Creating an ACL
 * **Example:** Allow a primary nameserver range
 * ```typescript
 * const acl = yield* Cloudflare.DNS.ZoneTransferAcl("PrimaryNs", {
 *   ipRange: "192.0.2.48/28",
 * });
 * ```
 *
 * **Example:** ACL with an explicit name
 * ```typescript
 * const acl = yield* Cloudflare.DNS.ZoneTransferAcl("PrimaryNs", {
 *   name: "primary-nameservers",
 *   ipRange: "2001:db8::/64",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/dns/zone-setups/zone-transfers/
 *
 * @resource
 * @product DNS
 * @category Domains & DNS
 */
export declare const ZoneTransferAcl: import("../../Resource.ts").ResourceClass<ZoneTransferAcl>;
/**
 * Returns true if the given value is a ZoneTransferAcl resource.
 */
export declare const isZoneTransferAcl: (value: unknown) => value is ZoneTransferAcl;
export declare const ZoneTransferAclProvider: () => import("effect/Layer").Layer<Provider.Provider<ZoneTransferAcl>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | dns.CloudflareOpContext>;
export {};
//# sourceMappingURL=ZoneTransferAcl.d.ts.map