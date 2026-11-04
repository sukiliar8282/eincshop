import * as iam from "@distilled.cloud/aws/iam";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface SigningCertificateProps {
    /**
     * User that owns the signing certificate.
     */
    userName: string;
    /**
     * X.509 signing certificate body.
     */
    certificateBody: string;
    /**
     * Desired certificate status.
     * @default "Active"
     */
    status?: iam.StatusType;
}
export interface SigningCertificate extends Resource<"AWS.IAM.SigningCertificate", SigningCertificateProps, {
    /** The IAM user the signing certificate belongs to. */
    userName: string;
    /** The unique ID of the signing certificate. */
    certificateId: string;
    /** The PEM-encoded certificate body. */
    certificateBody: string;
    /** Whether the certificate is `Active` or `Inactive`. */
    status: iam.StatusType;
    /** When the certificate was uploaded. */
    uploadDate: Date | undefined;
}, never, Providers> {
}
/**
 * An IAM signing certificate for a user.
 *
 * `SigningCertificate` uploads an X.509 signing certificate for legacy
 * IAM-integrated workflows that still depend on user-scoped certificates.
 * ### Managing User Certificates
 * **Example:** Upload a Signing Certificate
 * ```typescript
 * const user = yield* User("Signer", {
 *   userName: "build-signer",
 * });
 *
 * const certificate = yield* SigningCertificate("SigningCertificate", {
 *   userName: user.userName,
 *   certificateBody: "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----",
 * });
 * ```
 *
 * @resource
 */
export declare const SigningCertificate: import("../../Resource.ts").ResourceClass<SigningCertificate>;
export declare const SigningCertificateProvider: () => import("effect/Layer").Layer<Provider.Provider<SigningCertificate>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=SigningCertificate.d.ts.map