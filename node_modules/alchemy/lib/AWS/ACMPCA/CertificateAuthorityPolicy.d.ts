import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { PolicyDocument } from "../IAM/Policy.ts";
import type { Providers } from "../Providers.ts";
export interface CertificateAuthorityPolicyProps {
    /**
     * The ARN of the private CA the resource-based policy is attached to.
     * Changing this replaces the policy.
     */
    certificateAuthorityArn: string;
    /**
     * The resource-based permission policy, either as a structured
     * {@link PolicyDocument} or a raw JSON string (escape hatch). The policy
     * grants cross-account access on the CA to an Amazon Web Services
     * account, organization, or organizational unit — a policy that would
     * lock the CA owner out is rejected by AWS with the typed
     * `LockoutPreventedException`.
     */
    policy: PolicyDocument | string;
}
export interface CertificateAuthorityPolicy extends Resource<"AWS.ACMPCA.CertificateAuthorityPolicy", CertificateAuthorityPolicyProps, {
    /** The ARN of the CA the policy is attached to. */
    certificateAuthorityArn: string;
    /** The attached policy document as a JSON string. */
    policy: string;
}, never, Providers> {
}
/**
 * A resource-based policy attached to a private CA, granting cross-account
 * access — e.g. allowing a Certificate Manager (ACM) user in another
 * account to issue and renew certificates signed by this CA. This is the
 * policy Amazon Web Services Resource Access Manager (RAM) manages when a
 * CA is shared; attach it directly for fine-grained control.
 *
 * ### Attaching a CA Policy
 * **Example:** Allow Another Account to Issue Certificates
 * ```typescript
 * import * as ACMPCA from "alchemy/AWS/ACMPCA";
 *
 * const policy = yield* ACMPCA.CertificateAuthorityPolicy("CrossAccount", {
 *   certificateAuthorityArn: ca.certificateAuthorityArn,
 *   policy: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { AWS: "arn:aws:iam::123456789012:root" },
 *         Action: [
 *           "acm-pca:DescribeCertificateAuthority",
 *           "acm-pca:GetCertificate",
 *           "acm-pca:GetCertificateAuthorityCertificate",
 *           "acm-pca:ListPermissions",
 *           "acm-pca:IssueCertificate",
 *           "acm-pca:RevokeCertificate",
 *         ],
 *         Resource: ca.certificateAuthorityArn,
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const CertificateAuthorityPolicy: import("../../Resource.ts").ResourceClass<CertificateAuthorityPolicy>;
export declare const CertificateAuthorityPolicyProvider: () => import("effect/Layer").Layer<Provider.Provider<CertificateAuthorityPolicy>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=CertificateAuthorityPolicy.d.ts.map