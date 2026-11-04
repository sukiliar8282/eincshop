import * as acm from "@distilled.cloud/aws/acm";
import * as route53 from "@distilled.cloud/aws/route-53";
import * as Effect from "effect/Effect";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface CertificateProps {
    /**
     * Primary domain name for the certificate.
     */
    domainName: string;
    /**
     * Additional domain names to include on the certificate.
     */
    subjectAlternativeNames?: string[];
    /**
     * Validation method for the certificate request.
     * @default "DNS"
     */
    validationMethod?: acm.ValidationMethod;
    /**
     * Route 53 hosted zone used to auto-create DNS validation records.
     *
     * With `validationMethod: "DNS"` the certificate provider upserts the
     * validation records into this zone and waits for issuance. When
     * omitted, the most specific PUBLIC hosted zone in the account
     * containing `domainName` is inferred; if none matches, validation is
     * left to the caller (external DNS) and the certificate is returned
     * pending.
     */
    hostedZoneId?: string;
    /**
     * Requested key algorithm.
     */
    keyAlgorithm?: acm.KeyAlgorithm;
    /**
     * Certificate transparency logging preference.
     *
     * Updated in place via `UpdateCertificateOptions`. Note that AWS no longer
     * allows opting new public certificates out of CT logging.
     */
    certificateTransparencyLoggingPreference?: "ENABLED" | "DISABLED" | undefined;
    /**
     * Whether the certificate's private key can be exported with
     * `acm:ExportCertificate` (see the `ExportCertificate` binding).
     * Exportable public certificates carry an additional charge.
     *
     * Exportability can only be chosen when the certificate is requested —
     * ACM rejects `UpdateCertificateOptions` for it ("Export option for
     * certificates cannot be updated") — so changing this on an existing
     * certificate forces a replacement.
     */
    export?: "ENABLED" | "DISABLED" | undefined;
    /**
     * AWS region to request the certificate in.
     *
     * Defaults to `us-east-1` (the region CloudFront viewer certificates must
     * live in). Set this to the region of a regional consumer — e.g. an ALB
     * HTTPS listener requires the certificate in the load balancer's own
     * region. Changing the region replaces the certificate.
     * @default "us-east-1"
     */
    region?: string;
    /**
     * User-defined tags to apply to the certificate.
     */
    tags?: Record<string, string>;
}
/**
 * Binding contract of {@link Certificate}: composites contribute additional
 * subject alternative names without a circular input prop (e.g. a site
 * attached to an `AWS.Website.Router` binds its hostnames onto the Router's
 * certificate). ACM certificates are immutable — a change in the bound SAN
 * set plans a REPLACEMENT (new certificate requested and validated first,
 * consumers re-pointed, old certificate deleted last).
 */
export type CertificateBinding = {
    /**
     * Additional subject alternative names merged into the certificate's SAN
     * set at reconcile time.
     */
    subjectAlternativeNames?: string[];
};
export interface Certificate extends Resource<"AWS.ACM.Certificate", CertificateProps, {
    /**
     * ARN of the certificate.
     */
    certificateArn: string;
    /**
     * Primary domain name of the certificate.
     */
    domainName: string;
    /**
     * Additional subject alternative names on the certificate.
     */
    subjectAlternativeNames: string[];
    /**
     * Current ACM certificate status.
     */
    status: acm.CertificateStatus | undefined;
    /**
     * ACM-managed domain validation details, including DNS validation records.
     */
    domainValidationOptions: acm.DomainValidation[];
    /**
     * Requested validation method.
     */
    validationMethod: acm.ValidationMethod | undefined;
    /**
     * Requested key algorithm.
     */
    keyAlgorithm: acm.KeyAlgorithm | undefined;
    /**
     * Route 53 hosted zone used for automatic DNS validation, when configured.
     */
    hostedZoneId: string | undefined;
    /**
     * Certificate transparency logging preference currently on the certificate.
     */
    certificateTransparencyLoggingPreference: acm.CertificateTransparencyLoggingPreference | undefined;
    /**
     * Whether the certificate's private key is exportable.
     */
    export: acm.CertificateExport | undefined;
    /**
     * Current tags on the certificate.
     */
    tags: Record<string, string>;
    /**
     * Certificate issue timestamp, when issued.
     */
    issuedAt: Date | undefined;
    /**
     * Certificate expiration timestamp, when issued.
     */
    notAfter: Date | undefined;
}, CertificateBinding, Providers> {
}
/**
 * An ACM certificate for CloudFront and other AWS endpoints.
 *
 * `Certificate` requests an ACM certificate in `us-east-1`, which is the
 * region required for CloudFront viewer certificates. When `hostedZoneId` is
 * provided for DNS validation, the provider creates or updates the Route 53
 * validation records and waits for the certificate to be issued.
 * ### Requesting Certificates
 * **Example:** DNS-Validated Certificate
 * ```typescript
 * const cert = yield* Certificate("WebsiteCertificate", {
 *   domainName: "www.example.com",
 *   hostedZoneId: "Z1234567890",
 * });
 * ```
 *
 * **Example:** Certificate With SANs
 * ```typescript
 * const cert = yield* Certificate("WebsiteCertificate", {
 *   domainName: "example.com",
 *   subjectAlternativeNames: ["www.example.com"],
 *   hostedZoneId: "Z1234567890",
 * });
 * ```
 *
 * **Example:** Exportable Certificate
 * ```typescript
 * // `export: "ENABLED"` lets the ExportCertificate binding retrieve the
 * // certificate together with its (encrypted) private key at runtime.
 * const cert = yield* Certificate("ExportableCertificate", {
 *   domainName: "www.example.com",
 *   hostedZoneId: "Z1234567890",
 *   export: "ENABLED",
 * });
 * ```
 *
 * ### Certificate Expiry Events
 * **Example:** React to Approaching Expiration
 * ```typescript
 * // ACM emits "ACM Certificate Approaching Expiration" events through
 * // EventBridge — consume them with the ACM expiry event source, scoped
 * // to this certificate.
 * yield* AWS.ACM.consumeExpiryEvents(
 *   { certificateArns: [cert.certificateArn] },
 *   (events) =>
 *     Stream.runForEach(events, (event) =>
 *       Effect.log(
 *         `${event.detail.CommonName} expires in ${event.detail.DaysToExpiry} days`,
 *       ),
 *     ),
 * );
 * ```
 *
 * @resource
 */
export declare const Certificate: import("../../Resource.ts").ResourceClass<Certificate>;
export declare const CertificateProvider: () => import("effect/Layer").Layer<Provider.Provider<Certificate>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
/** @internal */
export declare const waitForRoute53Change: (changeId: string) => Effect.Effect<route53.ChangeInfo, Error | route53.GetChangeError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=Certificate.d.ts.map