import * as acmpca from "@distilled.cloud/aws/acm-pca";
import * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * X.500 distinguished name of the certificate authority. At least one
 * field must be set (typically `commonName`).
 */
export interface CertificateAuthoritySubject {
    /**
     * Fully qualified domain name (FQDN) associated with the certificate
     * subject, e.g. `corp.example.com`.
     */
    commonName?: string;
    /**
     * Legal name of the organization with which the certificate subject is
     * affiliated.
     */
    organization?: string;
    /**
     * A subdivision or unit of the organization with which the certificate
     * subject is affiliated.
     */
    organizationalUnit?: string;
    /**
     * Two-digit ISO 3166-1 country code, e.g. `US`.
     */
    country?: string;
    /**
     * State in which the subject of the certificate is located.
     */
    state?: string;
    /**
     * The locality (city) in which the certificate subject is located.
     */
    locality?: string;
    /**
     * The certificate serial number.
     */
    serialNumber?: string;
    /**
     * A title such as Mr. or Ms., assigned to the certificate subject.
     */
    title?: string;
    /**
     * Family name of the certificate subject.
     */
    surname?: string;
    /**
     * First name of the certificate subject.
     */
    givenName?: string;
    /**
     * Concatenation of first letters of the subject's first name, middle
     * name(s) and last name.
     */
    initials?: string;
    /**
     * Shortened version of a longer given name.
     */
    pseudonym?: string;
    /**
     * Disambiguating information for the certificate subject.
     */
    distinguishedNameQualifier?: string;
    /**
     * A qualifier appended to the subject's name, e.g. `Jr.` or `III`.
     */
    generationQualifier?: string;
}
/**
 * Certificate revocation list (CRL) configuration.
 */
export interface CrlConfigurationProps {
    /**
     * Whether Amazon Web Services Private CA maintains a CRL for the CA.
     */
    enabled: boolean;
    /**
     * Validity period of the CRL (e.g. `"7 days"` or `Duration.days(7)`).
     * Rounded to whole days on the wire (`ExpirationInDays`).
     * @default 7 days (service default when enabled)
     */
    expiration?: Duration.Input;
    /**
     * Alias to conceal the S3 bucket name inside issued certificates.
     */
    customCname?: string;
    /**
     * Name of the S3 bucket that receives the CRL. The bucket policy must
     * grant write access to Amazon Web Services Private CA.
     */
    s3BucketName?: string;
    /**
     * ACL applied to the CRL objects written to S3.
     */
    s3ObjectAcl?: "PUBLIC_READ" | "BUCKET_OWNER_FULL_CONTROL";
    /**
     * Whether to generate a complete or partitioned CRL.
     */
    crlType?: "COMPLETE" | "PARTITIONED";
    /**
     * Custom path inside the S3 bucket under which the CRL is stored.
     */
    customPath?: string;
}
/**
 * Online Certificate Status Protocol (OCSP) configuration.
 */
export interface OcspConfigurationProps {
    /**
     * Whether OCSP is enabled for the CA.
     */
    enabled: boolean;
    /**
     * Custom CNAME for the OCSP responder endpoint.
     */
    ocspCustomCname?: string;
}
export interface CertificateAuthorityProps {
    /**
     * The type of the certificate authority.
     * Changing this replaces the CA.
     * @default "ROOT"
     */
    type?: acmpca.CertificateAuthorityType;
    /**
     * The key algorithm used to generate the CA's private key.
     * Changing this replaces the CA.
     * @default "RSA_2048"
     */
    keyAlgorithm?: acmpca.KeyAlgorithm;
    /**
     * The signing algorithm the CA uses to sign certificate requests. Must
     * match the key algorithm family (RSA vs ECDSA).
     * Changing this replaces the CA.
     * @default "SHA256WITHRSA"
     */
    signingAlgorithm?: acmpca.SigningAlgorithm;
    /**
     * X.500 distinguished name of the CA. Changing this replaces the CA.
     */
    subject: CertificateAuthoritySubject;
    /**
     * Whether the CA issues general-purpose or short-lived (7 days or less)
     * certificates. Short-lived mode has a lower monthly price.
     * Changing this replaces the CA.
     * @default "GENERAL_PURPOSE"
     */
    usageMode?: acmpca.CertificateAuthorityUsageMode;
    /**
     * Security standard of the HSM that stores the CA key.
     * Changing this replaces the CA.
     * @default "FIPS_140_2_LEVEL_3_OR_HIGHER" (varies by region)
     */
    keyStorageSecurityStandard?: acmpca.KeyStorageSecurityStandard;
    /**
     * Certificate revocation configuration (CRL and/or OCSP). Applied at
     * create time; subsequent changes are applied via
     * `UpdateCertificateAuthority`, which AWS only permits while the CA is in
     * the `ACTIVE` or `DISABLED` state. When omitted the existing revocation
     * configuration is left unchanged.
     */
    revocationConfiguration?: {
        /**
         * Certificate revocation list (CRL) settings.
         */
        crlConfiguration?: CrlConfigurationProps;
        /**
         * Online Certificate Status Protocol (OCSP) settings.
         */
        ocspConfiguration?: OcspConfigurationProps;
    };
    /**
     * How long (7-30 days, e.g. `"7 days"`) the CA remains restorable after
     * deletion. Used when the CA is destroyed while in the
     * `PENDING_CERTIFICATE` or `DISABLED` state. Rounded to whole days on the
     * wire (`PermanentDeletionTimeInDays`).
     * @default 7 days
     */
    permanentDeletionTime?: Duration.Input;
    /**
     * Tags to apply to the CA. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface CertificateAuthority extends Resource<"AWS.ACMPCA.CertificateAuthority", CertificateAuthorityProps, {
    /** The ARN of the certificate authority. */
    certificateAuthorityArn: string;
    /** The status of the CA (e.g. `PENDING_CERTIFICATE`, `ACTIVE`). */
    status: acmpca.CertificateAuthorityStatus;
}, never, Providers> {
}
/**
 * An Amazon Web Services Private CA certificate authority.
 *
 * A newly created CA starts in the `PENDING_CERTIFICATE` state — to
 * activate it you must retrieve its CSR, sign it (self-sign for a root
 * CA), and import the signed certificate. Private CAs bill a monthly fee
 * for as long as they exist, so destroy test CAs promptly. Deletion
 * places the CA in the `DELETED` state for a configurable 7-30 day
 * restoration window.
 * ### Creating a Certificate Authority
 * **Example:** Root CA
 * ```typescript
 * import * as ACMPCA from "alchemy/AWS/ACMPCA";
 *
 * const ca = yield* ACMPCA.CertificateAuthority("RootCA", {
 *   subject: { commonName: "corp.example.com" },
 * });
 * ```
 *
 * **Example:** ECDSA Subordinate CA
 * ```typescript
 * const ca = yield* ACMPCA.CertificateAuthority("IssuingCA", {
 *   type: "SUBORDINATE",
 *   keyAlgorithm: "EC_prime256v1",
 *   signingAlgorithm: "SHA256WITHECDSA",
 *   subject: {
 *     commonName: "issuing.corp.example.com",
 *     organization: "Example Corp",
 *     country: "US",
 *   },
 * });
 * ```
 *
 * **Example:** Short-Lived Certificate Mode
 * ```typescript
 * const ca = yield* ACMPCA.CertificateAuthority("ShortLivedCA", {
 *   subject: { commonName: "ephemeral.example.com" },
 *   usageMode: "SHORT_LIVED_CERTIFICATE",
 * });
 * ```
 *
 * ### Revocation
 * **Example:** CA with CRL published to S3
 * ```typescript
 * const ca = yield* ACMPCA.CertificateAuthority("RootCA", {
 *   subject: { commonName: "corp.example.com" },
 *   revocationConfiguration: {
 *     crlConfiguration: {
 *       enabled: true,
 *       expiration: "7 days",
 *       s3BucketName: bucket.bucketName,
 *     },
 *   },
 * });
 * ```
 *
 * ### Granting ACM Access
 * **Example:** Allow ACM to auto-renew certificates issued by this CA
 * ```typescript
 * const permission = yield* ACMPCA.Permission("AcmRenewal", {
 *   certificateAuthorityArn: ca.certificateAuthorityArn,
 * });
 * ```
 *
 * ### Reacting to CA Events
 * **Example:** Consume ACM PCA Events from EventBridge
 * ```typescript
 * // ACM PCA emits lifecycle events (certificate issuance, expiry, CRL and
 * // audit-report generation) on the default EventBridge bus under the
 * // `aws.acm-pca` source — consume them with the generic EventBridge
 * // event source; there is no ACM PCA-specific notification config.
 * yield* AWS.EventBridge.consumeBusEvents(
 *   {
 *     source: ["aws.acm-pca"],
 *     "detail-type": ["ACM Private CA Certificate Issuance"],
 *   },
 *   (events) =>
 *     Stream.runForEach(events, (event) => Effect.log(event.detail)),
 * );
 * ```
 *
 * @resource
 */
export declare const CertificateAuthority: import("../../Resource.ts").ResourceClass<CertificateAuthority>;
export declare const CertificateAuthorityProvider: () => import("effect/Layer").Layer<Provider.Provider<CertificateAuthority>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=CertificateAuthority.d.ts.map