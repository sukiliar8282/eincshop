import * as originCa from "@distilled.cloud/cloudflare/origin-ca-certificates";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.OriginCaCertificate.OriginCaCertificate";
type TypeId = typeof TypeId;
/**
 * Signature type requested on the certificate: `origin-rsa` (RSA),
 * `origin-ecc` (ECDSA), or `keyless-certificate` (for Keyless SSL servers).
 */
export type RequestType = "origin-rsa" | "origin-ecc" | "keyless-certificate";
/**
 * Number of days the certificate should be valid for. Cloudflare only
 * accepts this fixed set of validity periods.
 */
export type Validity = 7 | 30 | 90 | 365 | 730 | 1095 | 5475;
export interface Props {
    /**
     * The Certificate Signing Request (CSR) in PEM format (newline-encoded).
     * The CSR's key is yours; Cloudflare only signs it. Immutable — changing
     * the CSR triggers a replacement (a new certificate is issued and the old
     * one is revoked).
     */
    csr: string;
    /**
     * Hostnames or wildcard names (e.g. `*.example.com`) bound to the
     * certificate. Hostnames must be fully qualified domain names belonging
     * to zones on your account. Immutable — changing the hostnames triggers
     * a replacement.
     */
    hostnames: string[];
    /**
     * Signature type desired on the certificate: `origin-rsa` (RSA),
     * `origin-ecc` (ECDSA), or `keyless-certificate` (for Keyless SSL
     * servers). Immutable — changing the request type triggers a replacement.
     */
    requestType: RequestType;
    /**
     * The number of days for which the certificate should be valid.
     * Immutable — changing the validity triggers a replacement.
     * @default 5475
     */
    requestedValidity?: Validity;
}
export interface Attributes {
    /**
     * Cloudflare-assigned identifier of the certificate (a long decimal
     * serial string). Stable for the lifetime of the certificate.
     */
    certificateId: string;
    /**
     * The signed Origin CA certificate in PEM format (newline-encoded).
     * Install this on your origin server alongside the private key that
     * produced the CSR.
     */
    certificate: string;
    /**
     * The Certificate Signing Request the certificate was issued for.
     */
    csr: string;
    /**
     * Hostnames or wildcard names bound to the certificate.
     */
    hostnames: string[];
    /**
     * Signature type on the certificate.
     */
    requestType: RequestType;
    /**
     * The number of days the certificate was requested to be valid for.
     */
    requestedValidity: number;
    /**
     * When the certificate expires.
     */
    expiresOn: string | undefined;
}
export type OriginCaCertificate = Resource<TypeId, Props, Attributes, never, Providers>;
/**
 * A Cloudflare Origin CA certificate — a free certificate signed by
 * Cloudflare's Origin CA that encrypts traffic between Cloudflare's edge
 * and your origin server. Origin CA certificates are only trusted by
 * Cloudflare (not by browsers), so they are used together with proxied
 * DNS records.
 *
 * You supply a CSR (keeping the private key to yourself); Cloudflare signs
 * it synchronously and returns the certificate PEM. The endpoints are
 * top-level (`/certificates`) — the zone is implied by the hostnames in the
 * request, which must belong to zones on your account.
 *
 * Certificates are fully immutable: there is no update API, so changing any
 * property triggers a replacement (a new certificate is issued, then the
 * old one is revoked). Destroying the resource revokes the certificate.
 * ### Issuing a certificate
 * **Example:** RSA certificate for a single hostname
 * ```typescript
 * const cert = yield* Cloudflare.OriginCaCertificate.OriginCaCertificate("origin-cert", {
 *   csr: originCsrPem,
 *   hostnames: ["origin.example.com"],
 *   requestType: "origin-rsa",
 *   requestedValidity: 90,
 * });
 * ```
 *
 * **Example:** Wildcard ECDSA certificate with the default 15-year validity
 * ```typescript
 * const cert = yield* Cloudflare.OriginCaCertificate.OriginCaCertificate("wildcard-cert", {
 *   csr: wildcardCsrPem,
 *   hostnames: ["example.com", "*.example.com"],
 *   requestType: "origin-ecc",
 * });
 * ```
 *
 * ### Using the certificate
 * **Example:** Install the signed PEM on your origin
 * ```typescript
 * // The signed certificate is returned synchronously on create:
 * const pem = cert.certificate; // "-----BEGIN CERTIFICATE-----\n..."
 * const expires = cert.expiresOn;
 * ```
 *
 * @see https://developers.cloudflare.com/ssl/origin-configuration/origin-ca/
 *
 * @resource
 * @product Origin CA Certificates
 * @category SSL/TLS & Certificates
 */
export declare const OriginCaCertificate: import("../../Resource.ts").ResourceClass<OriginCaCertificate>;
/**
 * Returns true if the given value is an OriginCaCertificate resource.
 */
export declare const isOriginCaCertificate: (value: unknown) => value is OriginCaCertificate;
export declare const OriginCaCertificateProvider: () => import("effect/Layer").Layer<Provider.Provider<OriginCaCertificate>, never, CloudflareEnvironment | originCa.CloudflareOpContext>;
export {};
//# sourceMappingURL=OriginCaCertificate.d.ts.map