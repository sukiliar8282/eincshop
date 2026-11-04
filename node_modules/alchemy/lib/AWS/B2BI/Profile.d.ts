import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ProfileProps {
    /**
     * The name of the profile.
     */
    name: string;
    /**
     * Name for the business associated with this profile.
     */
    businessName: string;
    /**
     * The phone number associated with the business, in E.164 format
     * (e.g. `+1234567890`).
     */
    phone: string;
    /**
     * The email address associated with this customer profile.
     */
    email?: string;
    /**
     * Whether Amazon Web Services logs each event in an Amazon CloudWatch log
     * group for the profile. Immutable after creation — changing it replaces
     * the profile.
     * @default "ENABLED"
     */
    logging?: "ENABLED" | "DISABLED";
    /**
     * User-defined tags for the profile.
     */
    tags?: Record<string, string>;
}
export interface Profile extends Resource<"AWS.B2BI.Profile", ProfileProps, {
    /**
     * Service-assigned unique ID of the profile.
     */
    profileId: string;
    /**
     * ARN of the profile.
     */
    profileArn: string;
    /**
     * Name of the profile.
     */
    name: string;
    /**
     * Business name associated with the profile.
     */
    businessName: string;
    /**
     * CloudWatch log group created for the profile when logging is enabled.
     */
    logGroupName: string | undefined;
}, never, Providers> {
}
/**
 * An AWS B2B Data Interchange (B2BI) customer profile. A profile is the
 * mechanism used to model a distinct private network; you can have up to
 * five profiles per account. Profiles are credential-free and fully
 * self-service, so their lifecycle is directly testable.
 * ### Creating a Profile
 * **Example:** Basic Profile
 * ```typescript
 * const profile = yield* B2BI.Profile("Acme", {
 *   name: "Acme Trading",
 *   businessName: "Acme Corp",
 *   phone: "+15555550100",
 *   email: "edi@acme.example",
 * });
 * ```
 *
 * ### Disabling CloudWatch Logging
 * **Example:** Logging Disabled
 * ```typescript
 * const profile = yield* B2BI.Profile("Acme", {
 *   name: "Acme Trading",
 *   businessName: "Acme Corp",
 *   phone: "+15555550100",
 *   logging: "DISABLED",
 * });
 * ```
 *
 * @resource
 */
export declare const Profile: import("../../Resource.ts").ResourceClass<Profile>;
export declare const ProfileProvider: () => import("effect/Layer").Layer<Provider.Provider<Profile>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Profile.d.ts.map