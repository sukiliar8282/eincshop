import * as clientCertificates from "@distilled.cloud/cloudflare/client-certificates";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.ClientCertificate.ClientCertificate";
type TypeId = typeof TypeId;
/**
 * Lifecycle status of a client certificate. `pending_reactivation` and
 * `pending_revocation` are in-progress asynchronous transitions.
 */
export type Status = "active" | "pending_reactivation" | "pending_revocation" | "revoked" | (string & {});
export interface Props {
    /**
     * Zone the client certificate is issued under. Client certificates are a
     * zone-level API Shield feature.
     *
     * Immutable — moving a certificate between zones triggers a replacement.
     */
    zoneId: string;
    /**
     * The Certificate Signing Request (CSR) in PEM format. Must be
     * newline-encoded. Cloudflare's Managed CA signs this CSR and returns the
     * client certificate.
     *
     * Immutable — the API has no way to re-sign a certificate, so changing the
     * CSR triggers a replacement. Plain `string` (not `string`) so it is
     * statically comparable inside `diff`.
     */
    csr: string;
    /**
     * The number of days the client certificate will be valid after the
     * `issuedOn` date.
     *
     * Immutable — changing the validity triggers a replacement.
     */
    validityDays: number;
}
export interface Attributes {
    /** Cloudflare-assigned identifier of the client certificate. */
    clientCertificateId: string;
    /** Zone the certificate was issued under. */
    zoneId: string;
    /** The signed client certificate in PEM format. */
    certificate: string;
    /** The CSR the certificate was issued from, as echoed by Cloudflare. */
    csr: string;
    /** Common Name parsed from the CSR. */
    commonName: string | undefined;
    /** Country parsed from the CSR. */
    country: string | undefined;
    /** State parsed from the CSR. */
    state: string | undefined;
    /** Location parsed from the CSR. */
    location: string | undefined;
    /** Organization parsed from the CSR. */
    organization: string | undefined;
    /** Organizational Unit parsed from the CSR. */
    organizationalUnit: string | undefined;
    /** ISO8601 date the certificate expires. */
    expiresOn: string | undefined;
    /** ISO8601 date the certificate was issued by the Managed CA. */
    issuedOn: string | undefined;
    /** SHA-256 fingerprint of the certificate. */
    fingerprintSha256: string | undefined;
    /** The serial number on the issued certificate. */
    serialNumber: string | undefined;
    /** The type of hash used for the certificate signature. */
    signature: string | undefined;
    /** Subject Key Identifier. */
    ski: string | undefined;
    /** Current lifecycle status of the certificate. */
    status: Status;
    /** The number of days the certificate is valid after `issuedOn`. */
    validityDays: number;
    /** Identifier of the Certificate Authority that issued the certificate. */
    certificateAuthorityId: string | undefined;
    /** Name of the Certificate Authority that issued the certificate. */
    certificateAuthorityName: string | undefined;
}
export type ClientCertificate = Resource<TypeId, Props, Attributes, never, Providers>;
/**
 * A zone-level API Shield mTLS client certificate signed by the Cloudflare
 * Managed CA.
 *
 * You submit a Certificate Signing Request (CSR) plus a validity period;
 * Cloudflare signs it and returns the client certificate PEM, which clients
 * then present when connecting to API Shield mTLS-protected hostnames.
 *
 * Client certificates are immutable: there is no API to change the CSR or
 * validity, so any prop change triggers a replacement. Deleting the resource
 * revokes the certificate — revoked certificates remain listed on the zone in
 * `revoked` status but are treated as deleted by this resource.
 *
 * Safety: client certificates carry no ownership markers. When there is no
 * prior state, `read` scans the zone for a non-revoked certificate issued
 * from the same CSR and reports it as `Unowned`, so the engine refuses to
 * take it over unless `--adopt` (or `adopt(true)`) is set.
 * ### Issuing a client certificate
 * **Example:** Sign a CSR with the Cloudflare Managed CA
 * ```typescript
 * const cert = yield* Cloudflare.ClientCertificate.ClientCertificate("ApiClient", {
 *   zoneId: zone.zoneId,
 *   csr: clientCsrPem,
 *   validityDays: 365,
 * });
 * // cert.certificate is the signed client certificate PEM
 * ```
 *
 * **Example:** Read the CSR from disk
 * ```typescript
 * const fs = yield* FileSystem.FileSystem;
 * const csr = yield* fs.readFileString("certs/client.csr");
 *
 * const cert = yield* Cloudflare.ClientCertificate.ClientCertificate("ApiClient", {
 *   zoneId: zone.zoneId,
 *   csr,
 *   validityDays: 90,
 * });
 * ```
 *
 * ### Rotation
 * **Example:** Rotate by changing the CSR
 * ```typescript
 * // csr and validityDays are immutable — changing either replaces the
 * // certificate: a new one is signed and the old one is revoked.
 * const cert = yield* Cloudflare.ClientCertificate.ClientCertificate("ApiClient", {
 *   zoneId: zone.zoneId,
 *   csr: rotatedCsrPem,
 *   validityDays: 365,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/ssl/client-certificates/
 *
 * @resource
 * @product Client Certificates
 * @category SSL/TLS & Certificates
 */
export declare const ClientCertificate: import("../../Resource.ts").ResourceClass<ClientCertificate>;
/**
 * Returns true if the given value is a ClientCertificate resource.
 */
export declare const isClientCertificate: (value: unknown) => value is ClientCertificate;
export declare const ClientCertificateProvider: () => import("effect/Layer").Layer<Provider.Provider<ClientCertificate>, never, CloudflareEnvironment | clientCertificates.CloudflareOpContext>;
export {};
//# sourceMappingURL=ClientCertificate.d.ts.map