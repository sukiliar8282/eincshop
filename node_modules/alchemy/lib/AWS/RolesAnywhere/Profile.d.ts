import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
declare const ProfileMissing_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "ProfileMissing";
} & Readonly<A>;
/**
 * Raised when the RolesAnywhere API acknowledges a profile write but returns
 * no profile detail and the profile cannot be found by name afterwards.
 */
export declare class ProfileMissing extends ProfileMissing_base<{
    readonly name: string;
}> {
}
/**
 * A single rule extracting a value from the certificate field, e.g.
 * `{ specifier: "CN" }` to map the common name.
 */
export interface ProfileMappingRule {
    /**
     * The specifier within the certificate field to map, e.g. `CN` or `OU`
     * for `x509Subject`.
     */
    specifier: string;
}
/**
 * A mapping from a certificate field to the session tags IAM Roles Anywhere
 * attaches to the vended session.
 */
export interface ProfileAttributeMapping {
    /**
     * The certificate field to map: `x509Subject`, `x509Issuer` or `x509SAN`.
     */
    certificateField: string;
    /**
     * The rules extracting specifiers from the certificate field.
     */
    mappingRules: ProfileMappingRule[];
}
export interface ProfileProps {
    /**
     * Name of the profile. If omitted, a unique name is generated from the app,
     * stage and logical ID. The name is updatable in place.
     */
    profileName?: string;
    /**
     * IAM role ARNs that IAM Roles Anywhere is trusted to assume on behalf of
     * authenticated workloads. Each role's trust policy must trust
     * `rolesanywhere.amazonaws.com`.
     */
    roleArns: string[];
    /**
     * An inline IAM session policy (JSON) applied to the vended session,
     * further restricting the assumed role's effective permissions.
     */
    sessionPolicy?: string;
    /**
     * Managed policy ARNs that apply to the vended session as a permissions
     * intersection.
     */
    managedPolicyArns?: string[];
    /**
     * How long vended session credentials are valid for, e.g. `"1 hour"` or
     * `Duration.minutes(15)` (a bare number is milliseconds). Rounded to whole
     * seconds on the wire (900-43200 seconds).
     * @default "1 hour"
     */
    duration?: Duration.Input;
    /**
     * Whether temporary credential requests must include instance properties.
     * Immutable after creation — changing it replaces the profile.
     * @default false
     */
    requireInstanceProperties?: boolean;
    /**
     * Whether the vended session can carry a caller-specified role session
     * name.
     * @default false
     */
    acceptRoleSessionName?: boolean;
    /**
     * Mappings from certificate fields (`x509Subject`, `x509Issuer`,
     * `x509SAN`) to the session tags attached to the vended session. Fields
     * omitted here keep their AWS default mapping; a field previously managed
     * by this resource and later removed has its custom mapping deleted.
     */
    attributeMappings?: ProfileAttributeMapping[];
    /**
     * Whether the profile is enabled. When disabled, temporary credential
     * requests with this profile fail.
     * @default true
     */
    enabled?: boolean;
    /**
     * User-defined tags for the profile.
     */
    tags?: Record<string, string>;
}
export interface Profile extends Resource<"AWS.RolesAnywhere.Profile", ProfileProps, {
    /**
     * Unique ID of the profile.
     */
    profileId: string;
    /**
     * ARN of the profile.
     */
    profileArn: string;
    /**
     * Name of the profile.
     */
    profileName: string;
    /**
     * IAM role ARNs the profile can vend sessions for.
     */
    roleArns: string[];
    /**
     * Whether the profile is enabled.
     */
    enabled: boolean;
}, never, Providers> {
}
/**
 * An IAM Roles Anywhere profile — the list of IAM roles that the Roles
 * Anywhere service is trusted to assume for authenticated certificate
 * identities, optionally intersected with managed policies and an inline
 * session policy.
 * ### Creating a Profile
 * **Example:** Basic Profile
 * ```typescript
 * const role = yield* IAM.Role("WorkloadRole", {
 *   assumeRolePolicyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { Service: "rolesanywhere.amazonaws.com" },
 *         Action: ["sts:AssumeRole", "sts:TagSession", "sts:SetSourceIdentity"],
 *       },
 *     ],
 *   },
 * });
 * const profile = yield* RolesAnywhere.Profile("Profile", {
 *   roleArns: [role.roleArn],
 * });
 * ```
 *
 * ### Restricting the Session
 * **Example:** Session Policy and Duration
 * ```typescript
 * const profile = yield* RolesAnywhere.Profile("Profile", {
 *   roleArns: [role.roleArn],
 *   duration: "15 minutes",
 *   sessionPolicy: JSON.stringify({
 *     Version: "2012-10-17",
 *     Statement: [
 *       { Effect: "Allow", Action: "s3:GetObject", Resource: "*" },
 *     ],
 *   }),
 * });
 * ```
 *
 * ### Mapping Certificate Attributes
 * **Example:** Session Tags from the Certificate Subject
 * ```typescript
 * const profile = yield* RolesAnywhere.Profile("Profile", {
 *   roleArns: [role.roleArn],
 *   attributeMappings: [
 *     {
 *       certificateField: "x509Subject",
 *       mappingRules: [{ specifier: "CN" }],
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export declare const Profile: import("../../Resource.ts").ResourceClass<Profile>;
export declare const ProfileProvider: () => import("effect/Layer").Layer<Provider.Provider<Profile>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=Profile.d.ts.map