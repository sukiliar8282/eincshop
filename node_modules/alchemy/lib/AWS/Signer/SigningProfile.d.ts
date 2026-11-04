import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * The signing certificate used to sign code. Required for platforms that
 * sign with an ACM certificate (e.g. `AWSIoTDeviceManagement-SHA256-ECDSA`);
 * the `AWSLambda-*` platforms use AWS-managed signing material and do not
 * accept one.
 */
export interface SigningMaterial {
    /**
     * The ARN of an AWS Certificate Manager (ACM) certificate used to sign
     * code.
     */
    certificateArn: string;
}
/**
 * How long a signature produced by this profile remains valid.
 */
export interface SignatureValidityPeriod {
    /**
     * The numerical value of the validity period.
     * @default 135
     */
    value?: number;
    /**
     * The unit of the validity period.
     * @default "MONTHS"
     */
    type?: "DAYS" | "MONTHS" | "YEARS";
}
/**
 * Overrides applied to the signing configuration of the chosen platform.
 */
export interface SigningPlatformOverrides {
    /**
     * Overrides for the platform's default encryption/hash algorithms.
     */
    signingConfiguration?: {
        /** The encryption algorithm used to sign code (`RSA` or `ECDSA`). */
        encryptionAlgorithm?: "RSA" | "ECDSA";
        /** The hash algorithm used to sign code (`SHA1` or `SHA256`). */
        hashAlgorithm?: "SHA1" | "SHA256";
    };
    /**
     * The signed image format for the platform, e.g. `JSONEmbedded`.
     */
    signingImageFormat?: string;
}
export interface SigningProfileProps {
    /**
     * Name of the signing profile. Must match `^[a-zA-Z0-9_]{2,64}$` (letters,
     * digits, and underscores only — no hyphens). If omitted, a unique
     * underscore-delimited name is generated. Changing it replaces the profile.
     */
    profileName?: string;
    /**
     * The ID of the signing platform, e.g. `AWSLambda-SHA384-ECDSA` for Lambda
     * code signing. Changing it replaces the profile.
     */
    platformId: string;
    /**
     * The ACM certificate used to sign code. Only for platforms that sign with
     * a customer-provided certificate; omit for the `AWSLambda-*` platforms.
     * Changing it replaces the profile.
     */
    signingMaterial?: SigningMaterial;
    /**
     * How long signatures produced by this profile stay valid.
     * Changing it replaces the profile.
     * @default 135 MONTHS
     */
    signatureValidityPeriod?: SignatureValidityPeriod;
    /**
     * Overrides of the platform's default signing configuration.
     * Changing them replaces the profile.
     */
    overrides?: SigningPlatformOverrides;
    /**
     * Map of key-value pairs for signing, attached as-is to every signing job
     * started with this profile. Changing them replaces the profile. Rejected
     * by the `AWSLambda-*` platforms ("Signing parameters should not be
     * present when using AWSLambda-SHA384-ECDSA platform").
     */
    signingParameters?: Record<string, string>;
    /**
     * User tags to attach to the signing profile. Tags are the only mutable
     * aspect of a signing profile.
     */
    tags?: Record<string, string>;
}
export interface SigningProfile extends Resource<"AWS.Signer.SigningProfile", SigningProfileProps, {
    /** The name of the signing profile. */
    profileName: string;
    /** The ARN of the signing profile (unversioned). */
    arn: string;
    /** The current version of the signing profile. */
    profileVersion: string;
    /** The ARN of the current signing profile version. */
    profileVersionArn: string;
    /** The ID of the signing platform. */
    platformId: string;
    /** The status of the signing profile (`Active`, `Canceled`, `Revoked`). */
    status: string;
}, never, Providers> {
}
/**
 * An AWS Signer signing profile — a code-signing template (platform +
 * signing material + signature validity) used to sign code, most commonly
 * as the trust anchor for Lambda code signing configs.
 *
 * `PutSigningProfile` is create-only in practice (re-putting an existing
 * name fails with "Profile with name X already exists"), so every property
 * except tags is immutable — changing one replaces the profile under a new
 * generated name. On destroy the profile is canceled — AWS retains canceled
 * profiles (the name stays reserved) and deletes them per its data-retention
 * policy, so prefer generated names over fixed `profileName`s.
 *
 * ### Creating a Signing Profile
 * **Example:** Lambda Code-Signing Profile
 * ```typescript
 * const profile = yield* Signer.SigningProfile("release-profile", {
 *   platformId: "AWSLambda-SHA384-ECDSA",
 * });
 * ```
 *
 * **Example:** Profile with Signature Validity Period
 * ```typescript
 * const profile = yield* Signer.SigningProfile("release-profile", {
 *   platformId: "AWSLambda-SHA384-ECDSA",
 *   signatureValidityPeriod: { value: 12, type: "MONTHS" },
 *   tags: { team: "platform" },
 * });
 * ```
 *
 * @resource
 */
export declare const SigningProfile: import("../../Resource.ts").ResourceClass<SigningProfile>;
export declare const SigningProfileProvider: () => import("effect/Layer").Layer<Provider.Provider<SigningProfile>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=SigningProfile.d.ts.map