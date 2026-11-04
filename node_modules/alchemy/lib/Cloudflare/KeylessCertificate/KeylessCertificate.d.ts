import * as keylessCertificates from "@distilled.cloud/cloudflare/keyless-certificates";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.KeylessCertificate.KeylessCertificate";
type TypeId = typeof TypeId;
/**
 * How the certificate chain is bundled when the certificate is served.
 * Create-only — Cloudflare has no API to change the bundle method after
 * upload, so changing it triggers a replacement.
 */
export type BundleMethod = "ubiquitous" | "optimal" | "force";
/**
 * Lifecycle status of a Keyless SSL configuration.
 */
export type Status = "active" | "deleted" | (string & {});
/**
 * Configuration for reaching the key server through a Cloudflare Tunnel
 * instead of over the public internet.
 */
export interface Tunnel {
    /**
     * Private IP of the key server inside the tunnel's virtual network.
     */
    privateIp: string;
    /**
     * Identifier of the Cloudflare Tunnel virtual network the key server is
     * reachable through (e.g. `VirtualNetwork.vnetId`).
     */
    vnetId: string;
}
export interface Props {
    /**
     * Zone the Keyless SSL certificate is uploaded to. Keyless SSL is a
     * zone-level Enterprise feature.
     *
     * Immutable — moving a Keyless SSL configuration between zones triggers a
     * replacement.
     */
    zoneId: string;
    /**
     * The zone's SSL certificate (or certificate and intermediates) in PEM
     * format. The private key never leaves your key server.
     *
     * Immutable — the PATCH API has no certificate field, so changing the
     * certificate triggers a replacement. Plain `string` (not `string`)
     * so it is statically comparable inside `diff`.
     */
    certificate: string;
    /**
     * Hostname of the externally running gokeyless key server that holds the
     * private key. Mutable — patched in place.
     */
    host: string;
    /**
     * Port Cloudflare uses to communicate with the key server. Mutable —
     * patched in place.
     * @default 24008
     */
    port?: number;
    /**
     * Human readable name for the Keyless SSL configuration. If omitted, a
     * deterministic name is generated from the app, stage, and logical ID.
     * Mutable — patched in place.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * How the certificate chain is bundled: `ubiquitous` (highest probability
     * of broad trust), `optimal` (shortest chain, newest intermediates), or
     * `force` (use the chain exactly as uploaded).
     *
     * Create-only — changing the bundle method triggers a replacement.
     * @default "ubiquitous"
     */
    bundleMethod?: BundleMethod;
    /**
     * Whether the Keyless SSL configuration is on or off. Mutable — patched in
     * place.
     * @default true
     */
    enabled?: boolean;
    /**
     * Reach the key server through a Cloudflare Tunnel virtual network instead
     * of the public internet.
     *
     * Adding or changing the tunnel is patched in place; removing a previously
     * configured tunnel triggers a replacement (the PATCH API cannot clear it).
     */
    tunnel?: Tunnel;
}
export interface Attributes {
    /** Cloudflare-assigned identifier of the Keyless SSL configuration. */
    keylessCertificateId: string;
    /** Zone the Keyless SSL configuration belongs to. */
    zoneId: string;
    /** Human readable name of the Keyless SSL configuration. */
    name: string;
    /** Hostname of the key server holding the private key. */
    host: string;
    /** Port Cloudflare uses to communicate with the key server. */
    port: number;
    /** Whether the Keyless SSL configuration is on or off. */
    enabled: boolean;
    /** Current lifecycle status of the Keyless SSL configuration. */
    status: Status;
    /** Permissions the requesting token has on this Keyless SSL. */
    permissions: string[];
    /** ISO8601 timestamp the Keyless SSL configuration was created. */
    createdOn: string;
    /** ISO8601 timestamp the Keyless SSL configuration was last modified. */
    modifiedOn: string;
    /** Tunnel configuration, when the key server is reached through a Cloudflare Tunnel. */
    tunnel: {
        privateIp: string;
        vnetId: string;
    } | undefined;
}
export type KeylessCertificate = Resource<TypeId, Props, Attributes, never, Providers>;
/**
 * A zone-level Keyless SSL configuration — serve TLS for a certificate whose
 * private key stays on your own key server instead of being uploaded to
 * Cloudflare.
 *
 * You upload only the certificate (and intermediates); Cloudflare reaches out
 * to an externally running [gokeyless](https://github.com/cloudflare/gokeyless)
 * key server at `host:port` (optionally through a Cloudflare Tunnel) for every
 * private-key operation.
 *
 * Keyless SSL is an **Enterprise-only** feature: on zones without the
 * entitlement, creation fails with the typed `KeylessSslNotAvailable` error
 * (Cloudflare code 1067).
 *
 * `host`, `port`, `name`, `enabled`, and `tunnel` are mutable in place;
 * `certificate` and `bundleMethod` are create-only and trigger a replacement.
 * ### Creating a Keyless SSL configuration
 * **Example:** Basic key server over the public internet
 * ```typescript
 * const keyless = yield* Cloudflare.KeylessCertificate.KeylessCertificate("SiteKeyless", {
 *   zoneId: zone.zoneId,
 *   certificate: certPem, // PEM, private key stays on your key server
 *   host: "keyless.example.com",
 *   port: 24008,
 * });
 * ```
 *
 * **Example:** Read the certificate from disk
 * ```typescript
 * const fs = yield* FileSystem.FileSystem;
 * const certificate = yield* fs.readFileString("certs/site.pem");
 *
 * const keyless = yield* Cloudflare.KeylessCertificate.KeylessCertificate("SiteKeyless", {
 *   zoneId: zone.zoneId,
 *   certificate,
 *   host: "keyless.example.com",
 * });
 * ```
 *
 * ### Reaching the key server through a Cloudflare Tunnel
 * **Example:** Private key server on a tunnel virtual network
 * ```typescript
 * const vnet = yield* Cloudflare.Tunnel.VirtualNetwork("KeylessVnet", {});
 *
 * const keyless = yield* Cloudflare.KeylessCertificate.KeylessCertificate("SiteKeyless", {
 *   zoneId: zone.zoneId,
 *   certificate: certPem,
 *   host: "keyless.internal",
 *   port: 24008,
 *   tunnel: {
 *     privateIp: "10.0.0.10",
 *     vnetId: vnet.vnetId,
 *   },
 * });
 * ```
 *
 * ### Rotation
 * **Example:** Rotate by changing the certificate
 * ```typescript
 * // `certificate` is create-only — changing it replaces the configuration:
 * // the new one is created and the old one is deleted.
 * const keyless = yield* Cloudflare.KeylessCertificate.KeylessCertificate("SiteKeyless", {
 *   zoneId: zone.zoneId,
 *   certificate: rotatedCertPem,
 *   host: "keyless.example.com",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/ssl/keyless-ssl/
 *
 * @resource
 * @product Keyless Certificates
 * @category SSL/TLS & Certificates
 */
export declare const KeylessCertificate: import("../../Resource.ts").ResourceClass<KeylessCertificate>;
/**
 * Returns true if the given value is a KeylessCertificate resource.
 */
export declare const isKeylessCertificate: (value: unknown) => value is KeylessCertificate;
export declare const KeylessCertificateProvider: () => import("effect/Layer").Layer<Provider.Provider<KeylessCertificate>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | keylessCertificates.CloudflareOpContext>;
export {};
//# sourceMappingURL=KeylessCertificate.d.ts.map