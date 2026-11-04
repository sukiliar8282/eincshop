import * as acm from "@distilled.cloud/cloudflare/acm";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Acm.CustomTrustStore";
type TypeId = typeof TypeId;
/**
 * Lifecycle status of an uploaded custom trust store certificate.
 * Upload is asynchronous: certificates start `initializing` and progress
 * to `active`; deletes go through `pending_deletion` before `deleted`.
 */
export type CustomTrustStoreStatus = "initializing" | "pending_deployment" | "active" | "pending_deletion" | "deleted" | "expired" | (string & {});
export interface CustomTrustStoreProps {
    /**
     * Zone the trust store certificate belongs to.
     *
     * Immutable — moving the certificate to another zone triggers a
     * replacement.
     */
    zoneId: string;
    /**
     * The root CA certificate in PEM format. Only root CA certificates are
     * accepted; intermediate and leaf certificates are rejected by
     * Cloudflare.
     *
     * Immutable — the API has no update operation, so changing the
     * certificate triggers a replacement.
     */
    certificate: string;
}
export interface CustomTrustStoreAttributes {
    /** Cloudflare-assigned identifier of the trust store certificate. */
    id: string;
    /** Zone the certificate belongs to. */
    zoneId: string;
    /** The root CA certificate in PEM format, as echoed by Cloudflare. */
    certificate: string;
    /** When the certificate expires. */
    expiresOn: string;
    /** The certificate authority that issued the certificate. */
    issuer: string;
    /** The type of hash used for the certificate. */
    signature: string;
    /** Deployment status of the certificate. */
    status: CustomTrustStoreStatus;
    /** When the certificate was uploaded to Cloudflare. */
    uploadedOn: string;
    /** When the certificate was last modified. */
    updatedAt: string;
}
export type CustomTrustStore = Resource<TypeId, CustomTrustStoreProps, CustomTrustStoreAttributes, never, Providers>;
/**
 * A root CA certificate in a zone's custom origin trust store
 * (`/zones/{zone_id}/acm/custom_trust_store`). Cloudflare uses the trust
 * store to validate your origin server's certificate when connecting to
 * the origin (e.g. with Full (strict) SSL and a private CA at the origin).
 *
 * Requires the Advanced Certificate Manager entitlement on the zone —
 * without it every call fails with the typed
 * `AdvancedCertificateManagerRequired` (code 1450) error.
 *
 * The certificate is immutable: there is no update API, so changing the
 * PEM (or the zone) replaces the resource. Trust store certificates carry
 * no ownership markers, so a cold `read` scans the zone for a certificate
 * with the same PEM body and reports it as `Unowned` — the engine refuses
 * to take it over unless `--adopt` (or `adopt(true)`) is set.
 * ### Uploading a root CA
 * **Example:** Trust a private root CA for origin pulls
 * ```typescript
 * const trustStore = yield* Cloudflare.Acm.CustomTrustStore("OriginRootCa", {
 *   zoneId: zone.zoneId,
 *   certificate: rootCaPem, // "-----BEGIN CERTIFICATE-----\n..."
 * });
 * ```
 *
 * **Example:** Load the PEM from a file
 * ```typescript
 * const fs = yield* FileSystem.FileSystem;
 * const pem = yield* fs.readFileString("./certs/root-ca.pem");
 * yield* Cloudflare.Acm.CustomTrustStore("OriginRootCa", {
 *   zoneId: zone.zoneId,
 *   certificate: pem,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/api/resources/acm/
 *
 * @resource
 * @product ACM
 * @category SSL/TLS & Certificates
 */
export declare const CustomTrustStore: import("../../Resource.ts").ResourceClass<CustomTrustStore>;
/**
 * Returns true if the given value is a CustomTrustStore resource.
 */
export declare const isCustomTrustStore: (value: unknown) => value is CustomTrustStore;
export declare const CustomTrustStoreProvider: () => import("effect/Layer").Layer<Provider.Provider<CustomTrustStore>, never, CloudflareEnvironment | acm.CloudflareOpContext>;
export {};
//# sourceMappingURL=CustomTrustStore.d.ts.map