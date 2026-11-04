import * as web3 from "@distilled.cloud/cloudflare/web3";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Web3.Hostname";
type TypeId = typeof TypeId;
/**
 * The gateway a Web3 hostname resolves through: an Ethereum gateway, an
 * IPFS gateway pinned to a single DNSLink, or an IPFS universal-path
 * gateway that can serve any CID under `/ipfs/...` / `/ipns/...`.
 */
export type HostnameTarget = "ethereum" | "ipfs" | "ipfs_universal_path";
/**
 * Activation status of a Web3 hostname. Hostnames start `pending` until the
 * CNAME is verified at the edge; deletion is asynchronous (`deleting`).
 */
export type HostnameStatus = "active" | "pending" | "deleting" | "error";
export interface HostnameProps {
    /**
     * The zone the hostname is created in. The hostname must be a subdomain
     * of (or equal to) the zone's name.
     *
     * Stable — moving a hostname to another zone triggers a replacement.
     */
    zoneId: string;
    /**
     * The hostname that points to the target gateway via CNAME, e.g.
     * `gateway.example.com`.
     *
     * Immutable — the hostname is the resource's identity and cannot be
     * renamed, so changing it triggers a replacement.
     */
    name: string;
    /**
     * The target gateway of the hostname.
     *
     * Immutable — the API cannot change a hostname's target after creation,
     * so changing it triggers a replacement.
     */
    target: HostnameTarget;
    /**
     * The DNSLink value used when `target` is `ipfs`, e.g.
     * `/ipns/onboarding.ipfs.cloudflare.com`. Mutable — patched in place.
     */
    dnslink?: string;
    /**
     * An optional description of the hostname. Mutable — patched in place.
     */
    description?: string;
}
export interface HostnameAttributes {
    /** Cloudflare-assigned identifier of the Web3 hostname. */
    hostnameId: string;
    /** The zone the hostname belongs to. */
    zoneId: string;
    /** The hostname that points to the target gateway via CNAME. */
    name: string;
    /** The target gateway of the hostname. */
    target: HostnameTarget;
    /** The DNSLink value, if the target is `ipfs`. */
    dnslink: string | undefined;
    /** The hostname's description, if set. */
    description: string | undefined;
    /** Activation status of the hostname. */
    status: HostnameStatus;
    /** ISO8601 creation timestamp. */
    createdOn: string | undefined;
    /** ISO8601 last-modified timestamp. */
    modifiedOn: string | undefined;
}
export type Hostname = Resource<TypeId, HostnameProps, HostnameAttributes, never, Providers>;
/**
 * A Cloudflare Web3 gateway hostname — serve Ethereum or IPFS content from
 * a hostname on your zone via Cloudflare's distributed web gateways.
 *
 * A hostname's identity is its `name` within the zone; only `dnslink` and
 * `description` are mutable, so changing `name`, `target`, or `zoneId`
 * triggers a replacement. Hostnames activate asynchronously: they start in
 * `pending` status and flip to `active` once the CNAME is verified.
 *
 * Note: Cloudflare has restricted Web3 gateways for new customers — on
 * accounts without the entitlement, creation fails with the typed
 * `Web3HostnameNotEntitled` error.
 *
 * Safety: Web3 hostnames carry no ownership markers. When there is no prior
 * state, `read` scans the zone for an existing hostname with the same name
 * and reports it as `Unowned`, so the engine refuses to take it over unless
 * `--adopt` (or `adopt(true)`) is set.
 * ### IPFS gateway
 * **Example:** IPFS hostname pinned to a DNSLink
 * ```typescript
 * const gateway = yield* Cloudflare.Web3.Hostname("IpfsGateway", {
 *   zoneId: zone.zoneId,
 *   name: "ipfs.example.com",
 *   target: "ipfs",
 *   dnslink: "/ipns/onboarding.ipfs.cloudflare.com",
 *   description: "IPFS gateway for example.com",
 * });
 * ```
 *
 * **Example:** IPFS universal-path gateway
 * ```typescript
 * // Serves any CID under /ipfs/... and /ipns/... paths.
 * const universal = yield* Cloudflare.Web3.Hostname("UniversalGateway", {
 *   zoneId: zone.zoneId,
 *   name: "gateway.example.com",
 *   target: "ipfs_universal_path",
 * });
 * ```
 *
 * ### Ethereum gateway
 * **Example:** Ethereum RPC hostname
 * ```typescript
 * yield* Cloudflare.Web3.Hostname("EthGateway", {
 *   zoneId: zone.zoneId,
 *   name: "eth.example.com",
 *   target: "ethereum",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/web3/
 *
 * @resource
 * @product Web3
 * @category Domains & DNS
 */
export declare const Hostname: import("../../Resource.ts").ResourceClass<Hostname>;
/**
 * Returns true if the given value is a Hostname resource.
 */
export declare const isHostname: (value: unknown) => value is Hostname;
export declare const HostnameProvider: () => import("effect/Layer").Layer<Provider.Provider<Hostname>, never, CloudflareEnvironment | web3.CloudflareOpContext>;
export {};
//# sourceMappingURL=Hostname.d.ts.map