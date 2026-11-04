import * as dns from "@distilled.cloud/cloudflare/dns";
import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.DNS.ZoneTransferTsig";
type TypeId = typeof TypeId;
export interface ZoneTransferTsigProps {
    /**
     * TSIG key name. If omitted, a unique name is generated from the app,
     * stage, and logical ID.
     *
     * Mutable — updated in place (PUT).
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * TSIG algorithm (e.g. `hmac-sha512.`).
     *
     * Mutable — updated in place (PUT).
     */
    algo: string;
    /**
     * TSIG secret (base64-encoded key material). Kept redacted — it is
     * never stored in the resource's attributes.
     *
     * Mutable — updated in place (PUT).
     */
    secret: Redacted.Redacted<string>;
}
export interface ZoneTransferTsigAttributes {
    /** Identifier of the TSIG. */
    tsigId: string;
    /** The Cloudflare account the TSIG belongs to. */
    accountId: string;
    /** TSIG key name. */
    name: string;
    /** TSIG algorithm. */
    algo: string;
}
export type ZoneTransferTsig = Resource<TypeId, ZoneTransferTsigProps, ZoneTransferTsigAttributes, never, Providers>;
/**
 * A Secondary DNS TSIG key
 * (`/accounts/{account_id}/secondary_dns/tsigs`) — shared-secret
 * authentication for zone transfers between Cloudflare and external
 * nameservers. Reference it from a {@link ZoneTransferPeer} via
 * `tsigId`.
 *
 * Requires the Secondary DNS (zone transfer) entitlement on the
 * account. All fields are mutable in place; the secret is redacted and
 * never persisted in attributes.
 * ### Creating a TSIG
 * **Example:** HMAC-SHA512 key
 * ```typescript
 * const tsig = yield* Cloudflare.DNS.ZoneTransferTsig("TransferKey", {
 *   algo: "hmac-sha512.",
 *   secret: Redacted.make(process.env.TSIG_SECRET!),
 * });
 * ```
 *
 * ### Using with a Peer
 * **Example:** Authenticate transfers from a primary nameserver
 * ```typescript
 * const peer = yield* Cloudflare.DNS.ZoneTransferPeer("Primary", {
 *   ip: "192.0.2.53",
 *   port: 53,
 *   tsigId: tsig.tsigId,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/dns/zone-setups/zone-transfers/
 *
 * @resource
 * @product DNS
 * @category Domains & DNS
 */
export declare const ZoneTransferTsig: import("../../Resource.ts").ResourceClass<ZoneTransferTsig>;
/**
 * Returns true if the given value is a ZoneTransferTsig resource.
 */
export declare const isZoneTransferTsig: (value: unknown) => value is ZoneTransferTsig;
export declare const ZoneTransferTsigProvider: () => import("effect/Layer").Layer<Provider.Provider<ZoneTransferTsig>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | dns.CloudflareOpContext>;
export {};
//# sourceMappingURL=ZoneTransferTsig.d.ts.map