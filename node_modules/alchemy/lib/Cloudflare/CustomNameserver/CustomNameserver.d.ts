import * as customNameservers from "@distilled.cloud/cloudflare/custom-nameservers";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.CustomNameserver.CustomNameserver";
type TypeId = typeof TypeId;
/**
 * Verification status of an account custom nameserver. Deprecated by
 * Cloudflare but still returned by the API.
 */
export type Status = "moved" | "pending" | "verified";
/**
 * A glue record (A/AAAA) that must be registered at the domain registrar
 * for the custom nameserver to resolve.
 */
export interface Record {
    /**
     * The record type of the glue record.
     */
    type: "A" | "AAAA" | undefined;
    /**
     * The IP address of the glue record.
     */
    value: string | undefined;
}
export interface Props {
    /**
     * The FQDN of the nameserver (e.g. `ns1.yourbrand.com`). Must be a
     * subdomain of a zone active on the same account.
     *
     * Immutable — this is the nameserver's identity; changing it triggers a
     * replacement.
     */
    nsName: string;
    /**
     * The number of the nameserver set this nameserver belongs to (1–5).
     *
     * Immutable — there is no update API; changing it triggers a replacement.
     * @default 1
     */
    nsSet?: number;
}
export interface Attributes {
    /**
     * The FQDN of the nameserver. Also the identifier used to delete it.
     */
    nsName: string;
    /**
     * The Cloudflare account the nameserver belongs to.
     */
    accountId: string;
    /**
     * The number of the nameserver set this nameserver belongs to.
     */
    nsSet: number | undefined;
    /**
     * Verification status of the nameserver (deprecated by Cloudflare but
     * still returned).
     */
    status: Status;
    /**
     * A/AAAA glue records to register at the domain registrar so the
     * nameserver resolves.
     */
    dnsRecords: Record[];
    /**
     * The zone (on this account) that `nsName` belongs to.
     */
    zoneTag: string;
}
export type CustomNameserver = Resource<TypeId, Props, Attributes, never, Providers>;
/**
 * An account-level custom (vanity) nameserver — e.g. `ns1.yourbrand.com` —
 * that zones on the account can use instead of their assigned
 * `*.ns.cloudflare.com` names.
 *
 * The nameserver's identity is its `nsName` (FQDN) within the account.
 * There is no update API: both `nsName` and `nsSet` are immutable, so
 * changing either triggers a replacement. After creation, Cloudflare
 * returns the A/AAAA glue records (`dnsRecords`) that must be registered
 * at the domain registrar.
 *
 * Requires the account custom nameservers entitlement (Business/Enterprise
 * or a paid add-on); on unentitled accounts every API call fails with the
 * typed `CustomNameserversNotEnabled` error.
 *
 * Safety: custom nameservers carry no ownership markers. When there is no
 * prior state, `read` scans the account for an existing nameserver with
 * the same `nsName` and reports it as `Unowned`, so the engine refuses to
 * take it over unless `--adopt` (or `adopt(true)`) is set.
 * ### Creating a custom nameserver
 * **Example:** Vanity nameserver on the default set
 * ```typescript
 * const ns1 = yield* Cloudflare.CustomNameserver.CustomNameserver("Ns1", {
 *   nsName: "ns1.yourbrand.com",
 * });
 *
 * // Glue records to register at your registrar:
 * const glue = ns1.dnsRecords; // [{ type: "A", value: "..." }, ...]
 * ```
 *
 * **Example:** Nameserver on a specific set
 * ```typescript
 * yield* Cloudflare.CustomNameserver.CustomNameserver("Ns2", {
 *   nsName: "ns2.yourbrand.com",
 *   nsSet: 2,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/dns/nameservers/custom-nameservers/account-custom-nameservers/
 *
 * @resource
 * @product Custom Nameservers
 * @category Domains & DNS
 */
export declare const CustomNameserver: import("../../Resource.ts").ResourceClass<CustomNameserver>;
/**
 * Returns true if the given value is a CustomNameserver resource.
 */
export declare const isCustomNameserver: (value: unknown) => value is CustomNameserver;
export declare const CustomNameserverProvider: () => import("effect/Layer").Layer<Provider.Provider<CustomNameserver>, never, CloudflareEnvironment | customNameservers.CloudflareOpContext>;
export {};
//# sourceMappingURL=CustomNameserver.d.ts.map