import * as emailSending from "@distilled.cloud/cloudflare/email-sending";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const SendingSubdomainTypeId: "Cloudflare.Email.SendingSubdomain";
type SendingSubdomainTypeId = typeof SendingSubdomainTypeId;
export interface SendingSubdomainProps {
    /**
     * Zone the sending subdomain is registered on. The subdomain name must
     * be within this zone.
     *
     * Stable — moving the subdomain to another zone triggers a replacement.
     */
    zoneId: string;
    /**
     * The fully-qualified subdomain to send email from (e.g.
     * `mail.example.com`). Must be within the zone.
     *
     * Stable — the Cloudflare API has no update operation for sending
     * subdomains, so a rename is a delete + create. Declared as plain
     * `string` (not `string`) so it is statically knowable in `diff`.
     */
    name: string;
}
export interface SendingSubdomainAttributes {
    /** Cloudflare-assigned identifier of the sending subdomain. */
    subdomainId: string;
    /** Zone the sending subdomain is registered on. */
    zoneId: string;
    /** The subdomain domain name. */
    name: string;
    /**
     * Whether Email Sending is enabled on this subdomain. Flips to `true`
     * once the auto-provisioned DNS records (DKIM/SPF/return-path) validate
     * — usually immediate for zones on Cloudflare DNS.
     */
    enabled: boolean;
    /** The DKIM selector used for email signing. */
    dkimSelector: string | undefined;
    /** The return-path domain used for bounce handling. */
    returnPathDomain: string | undefined;
    /** ISO8601 creation timestamp. */
    created: string | undefined;
    /** ISO8601 last-modified timestamp. */
    modified: string | undefined;
}
export type SendingSubdomain = Resource<SendingSubdomainTypeId, SendingSubdomainProps, SendingSubdomainAttributes, never, Providers>;
/**
 * Registers a Cloudflare Email Sending subdomain on a zone, enabling the
 * account to send transactional email from addresses on that subdomain.
 *
 * Creating the subdomain provisions DKIM, SPF, and return-path
 * configuration; for zones on Cloudflare DNS the required DNS records are
 * created automatically and `enabled` flips to `true` once they validate
 * (usually immediately).
 *
 * The resource is existence-only: the API offers create, get, list, and
 * delete but no update, so changing `name` or `zoneId` triggers a
 * replacement.
 *
 * Safety: sending subdomains carry no ownership markers. When there is no
 * prior state, `read` scans the zone for an existing subdomain with the
 * same name and reports it as `Unowned`, so the engine refuses to take it
 * over unless `--adopt` (or `adopt(true)`) is set.
 * ### Registering a sending subdomain
 * **Example:** Send mail from `mail.example.com`
 * ```typescript
 * const sending = yield* Cloudflare.Email.SendingSubdomain("Mail", {
 *   zoneId: zone.zoneId,
 *   name: "mail.example.com",
 * });
 * // sending.enabled — true once DNS records validated
 * // sending.dkimSelector / sending.returnPathDomain — provisioned config
 * ```
 *
 * ### Externally-hosted zones
 * **Example:** Look up the DNS records to create manually
 * ```typescript
 * import * as emailSending from "@distilled.cloud/cloudflare/email-sending";
 *
 * // For zones not on Cloudflare DNS, fetch the expected records and add
 * // them at your DNS host; `enabled` flips to true once they validate.
 * const records = yield* emailSending.getSubdomainDns.items({
 *   zoneId: sending.zoneId,
 *   subdomainId: sending.subdomainId,
 * }).pipe(Stream.runCollect);
 * ```
 *
 * @see https://developers.cloudflare.com/email-sending/
 *
 * @resource
 * @product Email
 * @category Email
 */
export declare const SendingSubdomain: import("../../Resource.ts").ResourceClass<SendingSubdomain>;
/**
 * Returns true if the given value is an SendingSubdomain resource.
 */
export declare const isSendingSubdomain: (value: unknown) => value is SendingSubdomain;
export declare const SendingSubdomainProvider: () => import("effect/Layer").Layer<Provider.Provider<SendingSubdomain>, never, CloudflareEnvironment | emailSending.CloudflareOpContext>;
export {};
//# sourceMappingURL=SendingSubdomain.d.ts.map