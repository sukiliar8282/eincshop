import * as ssl from "@distilled.cloud/cloudflare/ssl";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Ssl.CertificatePack";
type TypeId = typeof TypeId;
/**
 * Certificate Authorities available for Advanced Certificate Manager orders.
 *
 * - `google` — Google Trust Services
 * - `lets_encrypt` — Let's Encrypt (no `cloudflareBranding`)
 * - `ssl_com` — SSL.com (supports `email` validation)
 */
export type CertificatePackCertificateAuthority = "google" | "lets_encrypt" | "ssl_com";
/**
 * Domain Control Validation method used to prove ownership of the
 * certificate's hostnames.
 */
export type CertificatePackValidationMethod = "txt" | "http" | "email";
/**
 * Number of days the issued certificates are valid for.
 */
export type CertificatePackValidityDays = 14 | 30 | 90 | 365;
/**
 * Status of a certificate pack as reported by Cloudflare.
 */
export type CertificatePackStatus = "initializing" | "pending_validation" | "deleted" | "pending_issuance" | "pending_deployment" | "pending_deletion" | "pending_expiration" | "expired" | "active" | "initializing_timed_out" | "validation_timed_out" | "issuance_timed_out" | "deployment_timed_out" | "deletion_timed_out" | "pending_cleanup" | "staging_deployment" | "staging_active" | "deactivating" | "inactive" | "backup_issued" | "holding_deployment";
/**
 * A Domain Control Validation record for a certificate pack — create the
 * indicated TXT/CNAME record (or serve the HTTP token) to complete
 * validation when the pack is `pending_validation`.
 */
export interface CertificatePackValidationRecord {
    /** Name of the TXT record to create (for `txt` validation). */
    txtName?: string;
    /** Value of the TXT record (for `txt` validation). */
    txtValue?: string;
    /** URL that must serve `httpBody` (for `http` validation). */
    httpUrl?: string;
    /** Body the `httpUrl` must respond with (for `http` validation). */
    httpBody?: string;
    /** Name of the CNAME record to create (for delegated DCV). */
    cname?: string;
    /** Target of the CNAME record (for delegated DCV). */
    cnameTarget?: string;
    /** Approver email addresses (for `email` validation). */
    emails?: string[];
    /** Validation status of this record. */
    status?: string;
}
export interface CertificatePackProps {
    /**
     * Zone the certificate pack belongs to. Stable — moving a pack to a
     * different zone triggers a replacement.
     */
    zoneId: string;
    /**
     * Certificate Authority to order the certificates from.
     *
     * Immutable — the Cloudflare API has no way to change the CA of an
     * existing pack, so changing it triggers a replacement.
     */
    certificateAuthority: CertificatePackCertificateAuthority;
    /**
     * Hostnames the certificates cover. Must contain the zone apex, may
     * contain wildcards, and may not exceed 50 hosts.
     *
     * Immutable — hosts cannot be added to or removed from an existing
     * pack, so changing them (order-insensitively) triggers a replacement.
     */
    hosts: string[];
    /**
     * Domain Control Validation method for the order.
     *
     * Mutable — changed in place on the existing pack via the SSL
     * verification API (`PATCH /ssl/verification/{certificatePackId}`).
     */
    validationMethod: CertificatePackValidationMethod;
    /**
     * Validity period of the issued certificates, in days.
     *
     * Immutable — changing it triggers a replacement (re-order).
     */
    validityDays: CertificatePackValidityDays;
    /**
     * Whether to add Cloudflare branding to the order: a subdomain of
     * `sni.cloudflaressl.com` is used as the certificate's Common Name.
     *
     * Mutable — patched in place.
     *
     * @default false
     */
    cloudflareBranding?: boolean;
}
export interface CertificatePackAttributes {
    /** Cloudflare-assigned identifier of the certificate pack. */
    certificatePackId: string;
    /** Zone the pack belongs to. */
    zoneId: string;
    /**
     * Current status of the pack. Issuance is asynchronous — a freshly
     * ordered pack starts in `initializing`/`pending_validation` and only
     * reaches `active` once Domain Control Validation completes.
     */
    status: CertificatePackStatus;
    /** Hostnames the certificates cover. */
    hosts: string[];
    /** Certificate Authority the pack was ordered from. */
    certificateAuthority: string;
    /** Domain Control Validation method currently configured. */
    validationMethod: string | undefined;
    /** Validity period of the issued certificates, in days. */
    validityDays: number | undefined;
    /** Identifier of the primary certificate in the pack, once issued. */
    primaryCertificate: string | undefined;
    /**
     * Outstanding Domain Control Validation records — create these
     * TXT/CNAME records (or serve the HTTP tokens) to complete validation.
     */
    validationRecords: CertificatePackValidationRecord[] | undefined;
    /** DCV Delegation records for delegated domain validation. */
    dcvDelegationRecords: CertificatePackValidationRecord[] | undefined;
}
export type CertificatePack = Resource<TypeId, CertificatePackProps, CertificatePackAttributes, never, Providers>;
/**
 * An Advanced Certificate Manager (ACM) certificate pack — an order for
 * edge certificates covering a custom set of hostnames in a zone, with a
 * choice of Certificate Authority, validation method, and validity period.
 *
 * Requires the **Advanced Certificate Manager** subscription on the zone;
 * ordering without it fails with the typed `AdvancedCertificateManagerRequired`
 * error (Cloudflare code 1450).
 *
 * Issuance is asynchronous: the resource returns as soon as the order is
 * placed (status `initializing`/`pending_validation`) and does not wait for
 * `active`, because validation may require you to create DNS records first —
 * the outstanding records are exported as `validationRecords`.
 *
 * The pack's `certificateAuthority`, `hosts`, and `validityDays` are
 * immutable — changing any of them replaces the pack (a new order).
 * `validationMethod` and `cloudflareBranding` are updated in place.
 * ### Ordering a certificate pack
 * **Example:** Order an advanced certificate for the apex and a wildcard
 * ```typescript
 * const pack = yield* Cloudflare.Ssl.CertificatePack("ApexCert", {
 *   zoneId: zone.zoneId,
 *   certificateAuthority: "google",
 *   hosts: ["example.com", "*.example.com"],
 *   validationMethod: "txt",
 *   validityDays: 90,
 * });
 * ```
 *
 * **Example:** Order from Let's Encrypt with a short validity
 * ```typescript
 * yield* Cloudflare.Ssl.CertificatePack("ShortLivedCert", {
 *   zoneId: zone.zoneId,
 *   certificateAuthority: "lets_encrypt",
 *   hosts: ["example.com", "api.example.com"],
 *   validationMethod: "http",
 *   validityDays: 30,
 * });
 * ```
 *
 * ### Completing validation
 * **Example:** Create the DCV TXT records the order asks for
 * ```typescript
 * const pack = yield* Cloudflare.Ssl.CertificatePack("ApexCert", {
 *   zoneId: zone.zoneId,
 *   certificateAuthority: "google",
 *   hosts: ["example.com"],
 *   validationMethod: "txt",
 *   validityDays: 90,
 * });
 * // pack.validationRecords contains the txtName/txtValue pairs to create
 * // as DNS records so the CA can validate domain control.
 * ```
 *
 * @see https://developers.cloudflare.com/ssl/edge-certificates/advanced-certificate-manager/
 *
 * @resource
 * @product SSL/TLS
 * @category SSL/TLS & Certificates
 */
export declare const CertificatePack: import("../../Resource.ts").ResourceClass<CertificatePack>;
/**
 * Returns true if the given value is a CertificatePack resource.
 */
export declare const isCertificatePack: (value: unknown) => value is CertificatePack;
export declare const CertificatePackProvider: () => import("effect/Layer").Layer<Provider.Provider<CertificatePack>, never, CloudflareEnvironment | ssl.CloudflareOpContext>;
export {};
//# sourceMappingURL=CertificatePack.d.ts.map