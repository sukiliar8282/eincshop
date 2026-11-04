import * as customHostnames from "@distilled.cloud/cloudflare/custom-hostnames";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
/**
 * Domain control validation (DCV) method used to prove control over the
 * custom hostname before a certificate is issued.
 */
export type DcvMethod = "http" | "txt" | "email";
/**
 * Certificate authority that issues the managed certificate.
 */
export type CertificateAuthority = "digicert" | "google" | "lets_encrypt" | "ssl_com";
/**
 * Per-hostname TLS settings applied to the edge certificate.
 */
export type SslSettings = {
    /** Allowed cipher suites. */
    ciphers?: string[];
    /** Whether Early Hints (HTTP 103) is enabled. */
    earlyHints?: "on" | "off";
    /** Whether HTTP/2 is enabled. */
    http2?: "on" | "off";
    /** Minimum TLS version served for this hostname. */
    minTlsVersion?: "1.0" | "1.1" | "1.2" | "1.3";
    /** Whether TLS 1.3 is enabled. */
    tls_1_3?: "on" | "off";
};
/**
 * SSL configuration for a custom hostname's managed certificate.
 */
export type Ssl = {
    /**
     * Domain control validation method.
     * @default "txt"
     */
    method?: DcvMethod;
    /**
     * Level of validation for the certificate. Only domain validation
     * (`dv`) is supported.
     * @default "dv"
     */
    type?: "dv";
    /**
     * Certificate authority that issues the certificate. Omit to let
     * Cloudflare choose.
     */
    certificateAuthority?: CertificateAuthority;
    /**
     * How the intermediate chain is bundled with the leaf certificate.
     */
    bundleMethod?: "ubiquitous" | "optimal" | "force";
    /**
     * Whether to add Cloudflare branding to the certificate (adds
     * `sni.cloudflaressl.com` as the certificate common name).
     */
    cloudflareBranding?: boolean;
    /**
     * Whether the certificate also covers `*.hostname`. Toggling can
     * trigger certificate reissuance, but is still an in-place update.
     */
    wildcard?: boolean;
    /**
     * Bring-your-own leaf certificate (PEM). Requires `customKey`.
     */
    customCertificate?: string;
    /**
     * Private key (PEM) for `customCertificate`.
     */
    customKey?: string;
    /**
     * Identifier of a previously generated custom CSR.
     */
    customCsrId?: string;
    /**
     * Per-hostname TLS settings.
     */
    settings?: SslSettings;
};
export interface Props {
    /**
     * Zone the custom hostname is onboarded onto (the SaaS zone). Stable —
     * changing the zone triggers replacement.
     */
    zoneId: string;
    /**
     * The customer-owned hostname that will point at your zone via CNAME
     * (e.g. `app.customer.com`).
     *
     * Stable — the hostname is the resource's identity and is not
     * patchable; a rename is a delete + create. Declared as plain `string`
     * (not `string`) so it is statically knowable inside `diff`.
     */
    hostname: string;
    /**
     * SSL configuration for the managed certificate. Mutable — patched in
     * place (note that changing `ssl` can trigger certificate
     * reissuance).
     *
     * @default { method: "txt", type: "dv" }
     */
    ssl?: Ssl;
    /**
     * Unique key/value metadata for this hostname, available to Workers
     * via the request. Requires the Enterprise Cloudflare for SaaS
     * entitlement — the API rejects it otherwise.
     */
    customMetadata?: Record<string, unknown>;
    /**
     * Origin server to route traffic for this hostname to, overriding the
     * zone's fallback origin. Must be a DNS record within the zone.
     * Requires the Enterprise Cloudflare for SaaS entitlement.
     */
    customOriginServer?: string;
    /**
     * SNI value sent to `customOriginServer` during the TLS handshake, or
     * the literal `:request_host_header:`. Requires the Enterprise
     * Cloudflare for SaaS entitlement.
     */
    customOriginSni?: string;
}
/**
 * TXT record the customer must create to prove ownership of the
 * hostname (pre-validation).
 */
export interface OwnershipVerification {
    /** TXT record name. */
    name: string | undefined;
    /** Record type (always `txt`). */
    type: string | undefined;
    /** TXT record value. */
    value: string | undefined;
}
/**
 * HTTP token alternative for ownership verification.
 */
export interface OwnershipVerificationHttp {
    /** URL the token must be served from. */
    httpUrl: string | undefined;
    /** Token body to serve. */
    httpBody: string | undefined;
}
/**
 * A DCV record the customer must create/serve for certificate
 * validation.
 */
export interface ValidationRecord {
    /** CNAME validation record name. */
    cname: string | undefined;
    /** CNAME validation record target. */
    cnameTarget: string | undefined;
    /** Email addresses validation mail is sent to. */
    emails: string[] | undefined;
    /** HTTP validation token body. */
    httpBody: string | undefined;
    /** HTTP validation token URL. */
    httpUrl: string | undefined;
    /** Validation record status. */
    status: string | undefined;
    /** TXT validation record name. */
    txtName: string | undefined;
    /** TXT validation record value. */
    txtValue: string | undefined;
}
export interface Attributes {
    /** Cloudflare-assigned custom hostname UUID. */
    customHostnameId: string;
    /** Zone that owns this custom hostname. */
    zoneId: string;
    /** The customer-owned hostname. */
    hostname: string;
    /**
     * Activation status of the hostname (`pending`, `active`, …). A
     * hostname for a domain whose DNS the customer has not pointed yet
     * stays `pending` — activation is asynchronous and not blocked on.
     */
    status: string | undefined;
    /** Certificate status (`initializing`, `pending_validation`, `active`, …). */
    sslStatus: string | undefined;
    /** TXT record the customer must create to verify ownership. */
    ownershipVerification: OwnershipVerification | undefined;
    /** HTTP token alternative for ownership verification. */
    ownershipVerificationHttp: OwnershipVerificationHttp | undefined;
    /** DCV records the customer must satisfy for certificate issuance. */
    validationRecords: ValidationRecord[] | undefined;
}
export type CustomHostname = Resource<"Cloudflare.CustomHostname.CustomHostname", Props, Attributes, never, Providers>;
/**
 * A Cloudflare for SaaS custom hostname.
 *
 * Onboards a customer-owned hostname onto your zone with a managed TLS
 * certificate. The customer points their DNS (CNAME) at your zone;
 * Cloudflare validates ownership and issues a certificate
 * asynchronously. The first 100 custom hostnames are free on any plan.
 *
 * Traffic for custom hostnames is routed to the zone's
 * {@link FallbackOrigin} (or `customOriginServer` with the Enterprise
 * entitlement), so a fallback origin should usually be deployed
 * alongside.
 *
 * Safety: when there is no prior state, `read` scans the zone for an
 * existing hostname match. Custom hostnames carry no ownership markers,
 * so an existing match is reported as `Unowned` and the engine refuses
 * to take it over unless `--adopt` (or `adopt(true)`) is set.
 * ### Creating a Custom Hostname
 * **Example:** Basic custom hostname with TXT validation
 * ```typescript
 * const hostname = yield* Cloudflare.CustomHostname.CustomHostname("CustomerApp", {
 *   zoneId: zone.zoneId,
 *   hostname: "app.customer.com",
 * });
 * // Hand these to the customer so they can verify ownership:
 * // hostname.ownershipVerification?.name / .value
 * ```
 *
 * **Example:** HTTP validation with a specific certificate authority
 * ```typescript
 * yield* Cloudflare.CustomHostname.CustomHostname("CustomerApp", {
 *   zoneId: zone.zoneId,
 *   hostname: "app.customer.com",
 *   ssl: {
 *     method: "http",
 *     type: "dv",
 *     certificateAuthority: "google",
 *   },
 * });
 * ```
 *
 * ### Pairing with a Fallback Origin
 * **Example:** Route custom hostname traffic to your origin
 * ```typescript
 * const record = yield* Cloudflare.DNS.Record("Origin", {
 *   zoneId: zone.zoneId,
 *   name: "origin.my-saas.com",
 *   type: "A",
 *   content: "203.0.113.1",
 *   proxied: true,
 * });
 * yield* Cloudflare.CustomHostname.FallbackOrigin("Fallback", {
 *   zoneId: zone.zoneId,
 *   origin: record.name,
 * });
 * yield* Cloudflare.CustomHostname.CustomHostname("CustomerApp", {
 *   zoneId: zone.zoneId,
 *   hostname: "app.customer.com",
 * });
 * ```
 *
 * @resource
 * @product Custom Hostnames
 * @category Domains & DNS
 */
export declare const CustomHostname: import("../../Resource.ts").ResourceClass<CustomHostname>;
export declare const isCustomHostname: (value: unknown) => value is CustomHostname;
export declare const CustomHostnameProvider: () => import("effect/Layer").Layer<Provider.Provider<CustomHostname>, never, CloudflareEnvironment | customHostnames.CloudflareOpContext>;
//# sourceMappingURL=CustomHostname.d.ts.map