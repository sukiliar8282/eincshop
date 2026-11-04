import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ProfileProps {
    /**
     * Name of the Profile. If omitted, a unique name is generated from the
     * app, stage, and logical ID. Profiles have no update API for the name,
     * so changing it replaces the Profile.
     */
    name?: string;
    /**
     * User tags to attach to the Profile. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Profile extends Resource<"AWS.Route53Profiles.Profile", ProfileProps, {
    /** ID of the Profile (e.g. `rp-...`). */
    profileId: string;
    /** ARN of the Profile. */
    profileArn: string;
    /** Name of the Profile. */
    profileName: string;
}, never, Providers> {
}
/**
 * An Amazon Route 53 Profile — a reusable container of DNS configuration
 * (private hosted zones, Resolver rules, and DNS Firewall rule groups) that
 * can be associated with many VPCs at once.
 *
 * Attach DNS resources to the Profile with `ProfileResourceAssociation` and
 * apply the whole bundle to a VPC with `ProfileAssociation`.
 * ### Creating Profiles
 * **Example:** Basic Profile
 * ```typescript
 * import * as Route53Profiles from "alchemy/AWS/Route53Profiles";
 *
 * const profile = yield* Route53Profiles.Profile("DnsProfile");
 * ```
 *
 * **Example:** Profile with Tags
 * ```typescript
 * const profile = yield* Route53Profiles.Profile("DnsProfile", {
 *   name: "shared-dns-config",
 *   tags: { team: "platform" },
 * });
 * ```
 *
 * ### Applying a Profile to VPCs
 * **Example:** Associate the Profile with a VPC
 * ```typescript
 * const vpc = yield* EC2.Vpc("AppVpc", { cidrBlock: "10.0.0.0/16" });
 *
 * yield* Route53Profiles.ProfileAssociation("AppVpcDns", {
 *   profileId: profile.profileId,
 *   resourceId: vpc.vpcId,
 * });
 * ```
 *
 * @resource
 */
export declare const Profile: import("../../Resource.ts").ResourceClass<Profile>;
export declare const ProfileProvider: () => import("effect/Layer").Layer<Provider.Provider<Profile>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Profile.d.ts.map