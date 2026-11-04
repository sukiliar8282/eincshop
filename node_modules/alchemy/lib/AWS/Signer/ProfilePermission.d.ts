import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ProfilePermissionProps {
    /**
     * The name of the signing profile the permission is attached to.
     * Changing it replaces the permission.
     */
    profileName: string;
    /**
     * The Signer action the principal is allowed to perform on the profile:
     * `signer:StartSigningJob`, `signer:SignPayload`,
     * `signer:GetSigningProfile`, or `signer:RevokeSignature`.
     */
    action: string;
    /**
     * The AWS principal (account id, or IAM user/role ARN) receiving
     * cross-account permission to use the profile.
     */
    principal: string;
    /**
     * A unique statement id identifying this permission inside the profile's
     * resource policy. If omitted, a deterministic id is generated from the
     * logical id. Changing it replaces the permission.
     */
    statementId?: string;
    /**
     * The signing profile version the permission applies to. Omit to attach
     * the permission to the profile as a whole.
     */
    profileVersion?: string;
}
export interface ProfilePermission extends Resource<"AWS.Signer.ProfilePermission", ProfilePermissionProps, {
    /** The name of the signing profile the permission is attached to. */
    profileName: string;
    /** The statement id of the permission inside the profile's policy. */
    statementId: string;
}, never, Providers> {
}
/**
 * A cross-account permission on an AWS Signer signing profile — one statement
 * in the profile's resource policy granting another AWS account (or IAM
 * identity) a Signer action such as `signer:StartSigningJob`. The Signer
 * counterpart of CloudFormation's `AWS::Signer::ProfilePermission`.
 *
 * Permissions have no update API: changing the `action`, `principal`, or
 * `profileVersion` converges by removing and re-adding the statement under
 * the same statement id (revision-checked, so concurrent policy edits are
 * retried); changing `profileName` or `statementId` replaces the permission.
 *
 * ### Sharing a Signing Profile
 * **Example:** Allow Another Account to Sign
 * ```typescript
 * const profile = yield* Signer.SigningProfile("ReleaseProfile", {
 *   platformId: "AWSLambda-SHA384-ECDSA",
 * });
 *
 * const permission = yield* Signer.ProfilePermission("CiAccountCanSign", {
 *   profileName: profile.profileName,
 *   action: "signer:StartSigningJob",
 *   principal: "123456789012",
 * });
 * ```
 *
 * **Example:** Pin the Permission to a Profile Version
 * ```typescript
 * const permission = yield* Signer.ProfilePermission("CiAccountCanSign", {
 *   profileName: profile.profileName,
 *   action: "signer:StartSigningJob",
 *   principal: "123456789012",
 *   profileVersion: profile.profileVersion,
 * });
 * ```
 *
 * @resource
 */
export declare const ProfilePermission: import("../../Resource.ts").ResourceClass<ProfilePermission>;
export declare const ProfilePermissionProvider: () => import("effect/Layer").Layer<Provider.Provider<ProfilePermission>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ProfilePermission.d.ts.map