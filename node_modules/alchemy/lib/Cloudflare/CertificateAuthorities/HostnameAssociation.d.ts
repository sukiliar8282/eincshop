import * as certificateAuthorities from "@distilled.cloud/cloudflare/certificate-authorities";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.CertificateAuthorities.HostnameAssociation";
type TypeId = typeof TypeId;
export type HostnameAssociationProps = {
    /**
     * Zone whose hostnames should enforce mTLS. Stable — the zone is part of
     * the association's identity, so changing it triggers a replacement (the
     * old zone's association is cleared).
     */
    zoneId: string;
    /**
     * UUID of an uploaded CA certificate from the account-level mTLS
     * Certificate Management store (`Cloudflare.MtlsCertificate.MtlsCertificate` with
     * `ca: true`). When omitted, the hostnames are associated with the zone's
     * active Cloudflare Managed CA instead.
     *
     * Stable — the certificate keys the association, so changing it triggers
     * a replacement (the old certificate's hostname list is cleared).
     *
     * @default the active Cloudflare Managed CA
     */
    mtlsCertificateId?: string;
    /**
     * Fully-qualified hostnames in the zone that enforce mTLS for the keyed
     * certificate authority. Mutable — the desired list replaces the current
     * one in full on update.
     */
    hostnames: Array<string>;
};
export type HostnameAssociationAttributes = {
    /** Zone the association belongs to. */
    zoneId: string;
    /**
     * The mTLS CA certificate the hostnames are associated with, or
     * `undefined` when they are associated with the Cloudflare Managed CA.
     */
    mtlsCertificateId: string | undefined;
    /** Hostnames currently enforcing mTLS for the keyed CA. */
    hostnames: Array<string>;
};
export type HostnameAssociation = Resource<TypeId, HostnameAssociationProps, HostnameAssociationAttributes, never, Providers>;
/**
 * The set of hostnames in a Cloudflare zone that enforce mTLS, optionally
 * keyed by an uploaded mTLS CA certificate.
 *
 * Cloudflare models this as a settings singleton per
 * `(zone, mtls_certificate_id)` pair — a pure GET/PUT API over
 * `/zones/{zone_id}/certificate_authorities/hostname_associations`. With no
 * `mtlsCertificateId`, the hostnames are associated with the zone's active
 * Cloudflare Managed CA; with one, they are associated with that uploaded CA
 * certificate. Destroying the resource clears the association (PUT of an
 * empty hostname list).
 *
 * Safety: when there is no prior state but the keyed association already has
 * hostnames, `read` reports the existing list as `Unowned` — the engine
 * refuses to take it over (and would otherwise clobber a hand-managed list)
 * unless `--adopt` or `adopt(true)` is set.
 *
 * Note: an mTLS CA certificate cannot be deleted while hostname associations
 * still reference it. Pass the certificate id through
 * `cert.mtlsCertificateId` so the engine destroys the association before the
 * certificate.
 * ### Cloudflare Managed CA
 * **Example:** Enforce mTLS on a hostname with the Managed CA
 * ```typescript
 * yield* Cloudflare.CertificateAuthorities.HostnameAssociation("MtlsHosts", {
 *   zoneId: zone.zoneId,
 *   hostnames: ["api.example.com"],
 * });
 * ```
 *
 * ### Uploaded CA certificate
 * **Example:** Associate hostnames with an uploaded CA
 * ```typescript
 * const ca = yield* Cloudflare.MtlsCertificate.MtlsCertificate("ClientCa", {
 *   ca: true,
 *   certificates: caPem,
 * });
 *
 * yield* Cloudflare.CertificateAuthorities.HostnameAssociation("ClientCaHosts", {
 *   zoneId: zone.zoneId,
 *   mtlsCertificateId: ca.mtlsCertificateId,
 *   hostnames: ["api.example.com", "admin.example.com"],
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/api/resources/certificate_authorities/subresources/hostname_associations/
 *
 * @resource
 * @product Certificate Authorities
 * @category SSL/TLS & Certificates
 */
export declare const HostnameAssociation: import("../../Resource.ts").ResourceClass<HostnameAssociation>;
/**
 * Returns true if the given value is a HostnameAssociation resource.
 */
export declare const isHostnameAssociation: (value: unknown) => value is HostnameAssociation;
export declare const HostnameAssociationProvider: () => import("effect/Layer").Layer<Provider.Provider<HostnameAssociation>, never, CloudflareEnvironment | certificateAuthorities.CloudflareOpContext>;
export {};
//# sourceMappingURL=HostnameAssociation.d.ts.map