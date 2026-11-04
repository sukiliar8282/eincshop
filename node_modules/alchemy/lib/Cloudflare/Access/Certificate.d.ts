import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
export type CertificateProps = {
    /**
     * Display name for the certificate. Used as a stable identifier so the
     * provider can locate the certificate during adoption / state recovery.
     * If omitted, a unique name is generated from the stack/stage/logical id.
     *
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * The CA certificate content (PEM). Client certificates presented to
     * Access-protected applications must chain to this CA. The certificate
     * body is immutable — changing it replaces the resource.
     */
    certificate: string;
    /**
     * The hostnames of the Access applications that will use this
     * certificate for mTLS authentication.
     *
     * @default []
     */
    associatedHostnames?: string[];
};
export type Certificate = Resource<"Cloudflare.Access.Certificate", CertificateProps, {
    /** UUID of the certificate assigned by Cloudflare. */
    certificateId: string;
    /** Cloudflare account that owns the certificate. */
    accountId: string;
    /** Display name reported by Cloudflare. */
    name: string;
    /**
     * The PEM content that was uploaded. Cloudflare never returns the
     * certificate body, so the provider persists it to detect replacement.
     */
    certificate: string;
    /** The MD5 fingerprint of the certificate, computed by Cloudflare. */
    fingerprint: string | undefined;
    /** Hostnames currently associated with the certificate. */
    associatedHostnames: string[];
    /** Expiration timestamp of the CA certificate. */
    expiresOn: string | undefined;
}, never, Providers>;
/**
 * A Cloudflare Zero Trust Access mTLS certificate. Uploads a CA certificate
 * that Access uses to validate client certificates presented to protected
 * applications on the associated hostnames.
 *
 * The certificate body is immutable — changing the PEM replaces the
 * resource. The name and associated hostnames converge in place.
 * ### Creating a Certificate
 * **Example:** Upload a CA certificate
 * ```typescript
 * const ca = yield* Cloudflare.Access.Certificate("ClientCa", {
 *   certificate: CA_PEM, // -----BEGIN CERTIFICATE----- ...
 * });
 * ```
 *
 * **Example:** Certificate with associated hostnames
 * ```typescript
 * const ca = yield* Cloudflare.Access.Certificate("ClientCa", {
 *   name: "corp-client-ca",
 *   certificate: CA_PEM,
 *   associatedHostnames: ["app.example.com"],
 * });
 * ```
 *
 * ### Updating Hostnames
 * **Example:** Associate more hostnames in place
 * ```typescript
 * const ca = yield* Cloudflare.Access.Certificate("ClientCa", {
 *   certificate: CA_PEM,
 *   associatedHostnames: ["app.example.com", "admin.example.com"],
 * });
 * ```
 *
 * @resource
 * @product Access
 * @category Cloudflare One (Zero Trust)
 */
export declare const Certificate: import("../../Resource.ts").ResourceClass<Certificate>;
export declare const isCertificate: (value: unknown) => value is Certificate;
export declare const CertificateProvider: () => import("effect/Layer").Layer<Provider.Provider<Certificate>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | zeroTrust.CloudflareOpContext>;
//# sourceMappingURL=Certificate.d.ts.map