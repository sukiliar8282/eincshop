import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ServerCertificateProps {
    /**
     * Name of the server certificate. If omitted, a deterministic name is generated.
     */
    serverCertificateName?: string;
    /**
     * Optional IAM path prefix.
     * @default "/"
     */
    path?: string;
    /**
     * PEM-encoded leaf certificate body.
     */
    certificateBody: string;
    /**
     * PEM-encoded private key. AWS never returns this after upload.
     */
    privateKey: Redacted.Redacted<string> | string;
    /**
     * Optional PEM-encoded certificate chain.
     */
    certificateChain?: string;
    /**
     * User-defined tags.
     */
    tags?: Record<string, string>;
}
export interface ServerCertificate extends Resource<"AWS.IAM.ServerCertificate", ServerCertificateProps, {
    /** The ARN of the server certificate. */
    serverCertificateArn: string;
    /** The name of the server certificate. */
    serverCertificateName: string;
    /** The stable unique ID of the server certificate. */
    serverCertificateId: string | undefined;
    /** The IAM path of the server certificate. */
    path: string | undefined;
    /** The PEM-encoded certificate body. */
    certificateBody: string;
    /** The PEM-encoded certificate chain, if uploaded. */
    certificateChain: string | undefined;
    /** When the certificate was uploaded. */
    uploadDate: Date | undefined;
    /** When the certificate expires. */
    expiration: Date | undefined;
    /** The tags applied to the certificate. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An IAM server certificate.
 *
 * `ServerCertificate` uploads and tracks a TLS certificate bundle for legacy
 * IAM-integrated services. The private key is write-only and should be provided
 * as a redacted value when possible.
 * ### Uploading Server Certificates
 * **Example:** Upload a TLS Certificate
 * ```typescript
 * const certificate = yield* ServerCertificate("ApiTlsCertificate", {
 *   certificateBody: "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----",
 *   privateKey: Redacted.make(
 *     "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----",
 *   ),
 *   certificateChain: "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----",
 * });
 * ```
 *
 * @resource
 */
export declare const ServerCertificate: import("../../Resource.ts").ResourceClass<ServerCertificate>;
export declare const ServerCertificateProvider: () => import("effect/Layer").Layer<Provider.Provider<ServerCertificate>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ServerCertificate.d.ts.map