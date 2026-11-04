import * as customCertificates from "@distilled.cloud/cloudflare/custom-certificates";
import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.CustomCertificate.CustomCertificate";
type TypeId = typeof TypeId;
/**
 * How Cloudflare builds the certificate chain served to clients.
 *
 * A `ubiquitous` bundle has the highest probability of being verified
 * everywhere, even by clients using outdated or unusual trust stores. An
 * `optimal` bundle uses the shortest chain and newest intermediates. `force`
 * serves exactly the certificate you uploaded.
 */
export type BundleMethod = "ubiquitous" | "optimal" | "force";
/**
 * SNI support of the uploaded certificate. `legacy_custom` enables support
 * for legacy clients which do not include SNI in the TLS handshake (requires
 * dedicated IPs); `sni_custom` is the recommended modern option.
 */
export type Type = "legacy_custom" | "sni_custom";
/**
 * Lifecycle status of a custom certificate. Uploads are asynchronous —
 * a certificate transitions `initializing` → `active`.
 */
export type Status = "active" | "expired" | "deleted" | "pending" | "initializing" | (string & {});
/**
 * Geo Key Manager region restriction: where the certificate's private key
 * may be held locally for optimal TLS performance.
 */
export interface GeoRestrictions {
    /**
     * Region label: `us`, `eu`, or `highest_security`.
     */
    label: "us" | "eu" | "highest_security";
}
export interface Props {
    /**
     * Zone the certificate is uploaded to. Custom certificates are a
     * zone-level feature (Business and Enterprise plans only).
     *
     * Immutable — moving a certificate between zones triggers a replacement.
     */
    zoneId: string;
    /**
     * The zone's SSL certificate — the leaf certificate plus any
     * intermediates, in PEM format. Plain `string` (not `string`) so
     * its content hash is statically computable.
     *
     * Mutable — Cloudflare PATCHes a new certificate onto the same record,
     * keeping the certificate id stable across rotations.
     */
    certificate: string;
    /**
     * The certificate's private key in PEM format. Not required when
     * `customCsrId` is provided, in which case the private key is retrieved
     * from the CSR record held by Cloudflare.
     *
     * Write-only — Cloudflare never echoes the key back; a content hash of
     * the certificate/key pair is persisted in the attributes for diffing.
     */
    privateKey?: Redacted.Redacted<string>;
    /**
     * The identifier of a Custom CSR held by Cloudflare to source the private
     * key from, as an alternative to uploading `privateKey`.
     */
    customCsrId?: string;
    /**
     * How Cloudflare builds the certificate chain served to clients.
     * @default "ubiquitous"
     */
    bundleMethod?: BundleMethod;
    /**
     * SNI support: `sni_custom` (recommended) or `legacy_custom` (supports
     * non-SNI clients; requires dedicated IPs).
     *
     * Immutable — the PATCH endpoint does not accept `type`, so changing it
     * triggers a replacement.
     * @default "legacy_custom"
     */
    type?: Type;
    /**
     * Geo Key Manager region restriction for the private key. Mutually
     * exclusive with `policy`.
     */
    geoRestrictions?: GeoRestrictions;
    /**
     * Geo Key Manager policy expression (e.g.
     * `(country: US) or (region: EU)`) that determines where the private key
     * is held. Mutually exclusive with `geoRestrictions`. Cloudflare echoes
     * this back as the `policyRestrictions` attribute.
     */
    policy?: string;
    /**
     * The environment to deploy the certificate to. Staging deploys are an
     * Enterprise feature. Write-only — not echoed back by the API.
     * @default "production"
     */
    deploy?: "staging" | "production";
    /**
     * The order/priority in which the certificate is used in a request. A
     * higher priority breaks ties across overlapping `legacy_custom`
     * certificates. Synced via the prioritize endpoint when it differs from
     * the observed value.
     * @default API-assigned
     */
    priority?: number;
}
export interface Attributes {
    /** Cloudflare-assigned identifier of the custom certificate. Stable across in-place certificate rotations. */
    certificateId: string;
    /** Zone the certificate belongs to. */
    zoneId: string;
    /** Hostnames covered by the certificate. */
    hosts: string[];
    /** The certificate authority that issued the certificate. */
    issuer: string | undefined;
    /** The type of hash used for the certificate signature. */
    signature: string | undefined;
    /** ISO8601 date the certificate expires. */
    expiresOn: string | undefined;
    /** ISO8601 date the certificate was uploaded to Cloudflare. */
    uploadedOn: string | undefined;
    /** ISO8601 date the certificate was last modified. */
    modifiedOn: string | undefined;
    /** How Cloudflare builds the certificate chain served to clients. */
    bundleMethod: BundleMethod | undefined;
    /** SNI support the certificate was uploaded with. Not echoed by the API — persisted from the input props. */
    type: Type;
    /** The order/priority in which the certificate is used in a request. */
    priority: number | undefined;
    /** Lifecycle status of the certificate (`initializing` → `active`). */
    status: Status | undefined;
    /** Geo Key Manager policy expression, as echoed by the API for the `policy` prop. */
    policyRestrictions: string | undefined;
    /** Geo Key Manager region restriction, if set. */
    geoRestrictions: GeoRestrictions | undefined;
    /**
     * SHA-256 hash of the uploaded certificate/private key pair. Cloudflare
     * never echoes the PEM contents back, so this hash is the diff baseline
     * for deciding whether to re-push the certificate (a documented exception
     * to "observation > assumption").
     */
    contentHash: string;
}
export type CustomCertificate = Resource<TypeId, Props, Attributes, never, Providers>;
/**
 * A Cloudflare custom (BYO) edge certificate — upload your own SSL
 * certificate and private key to be served at Cloudflare's edge for a zone.
 *
 * Custom certificates are a **Business / Enterprise** feature; on lower
 * plans every API call fails with the typed `PlanLevelNotAllowed` error
 * (Cloudflare error code 1011).
 *
 * The certificate id is stable across in-place rotations: PATCHing a new
 * `certificate`/`privateKey` pair keeps the same id. Cloudflare never echoes
 * the PEM contents back, so a SHA-256 content hash of the pair is persisted
 * in the attributes and used as the rotation diff baseline. Only `zoneId`
 * and `type` force a replacement.
 * ### Uploading a certificate
 * **Example:** Basic SNI certificate
 * ```typescript
 * const cert = yield* Cloudflare.CustomCertificate.CustomCertificate("EdgeCert", {
 *   zoneId: zone.zoneId,
 *   certificate: certPem,
 *   privateKey: Redacted.make(keyPem),
 *   type: "sni_custom",
 * });
 * ```
 *
 * **Example:** Optimal bundle with a Geo Key Manager region
 * ```typescript
 * yield* Cloudflare.CustomCertificate.CustomCertificate("EuCert", {
 *   zoneId: zone.zoneId,
 *   certificate: certPem,
 *   privateKey: Redacted.make(keyPem),
 *   type: "sni_custom",
 *   bundleMethod: "optimal",
 *   geoRestrictions: { label: "eu" },
 * });
 * ```
 *
 * ### Rotating the certificate
 * **Example:** Rotate in place
 * ```typescript
 * // Changing `certificate`/`privateKey` PATCHes the same certificate id —
 * // no replacement, no coverage gap.
 * yield* Cloudflare.CustomCertificate.CustomCertificate("EdgeCert", {
 *   zoneId: zone.zoneId,
 *   certificate: renewedCertPem,
 *   privateKey: Redacted.make(renewedKeyPem),
 *   type: "sni_custom",
 * });
 * ```
 *
 * ### Prioritizing overlapping certificates
 * **Example:** Explicit priority
 * ```typescript
 * // Higher priority breaks ties across overlapping legacy_custom certs.
 * yield* Cloudflare.CustomCertificate.CustomCertificate("PrimaryCert", {
 *   zoneId: zone.zoneId,
 *   certificate: certPem,
 *   privateKey: Redacted.make(keyPem),
 *   priority: 1,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/ssl/edge-certificates/custom-certificates/
 *
 * @resource
 * @product Custom Certificates
 * @category SSL/TLS & Certificates
 */
export declare const CustomCertificate: import("../../Resource.ts").ResourceClass<CustomCertificate>;
/**
 * Returns true if the given value is a CustomCertificate resource.
 */
export declare const isCustomCertificate: (value: unknown) => value is CustomCertificate;
export declare const CustomCertificateProvider: () => import("effect/Layer").Layer<Provider.Provider<CustomCertificate>, never, CloudflareEnvironment | customCertificates.CloudflareOpContext>;
export {};
//# sourceMappingURL=CustomCertificate.d.ts.map