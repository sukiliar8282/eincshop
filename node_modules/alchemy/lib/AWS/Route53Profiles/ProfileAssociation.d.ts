import * as profiles from "@distilled.cloud/aws/route53profiles";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ProfileAssociationProps {
    /**
     * ID of the Route 53 Profile to apply. Changing it forces replacement.
     */
    profileId: string;
    /**
     * ID of the VPC to associate the Profile with. A VPC can have only one
     * Profile associated with it. Changing it forces replacement.
     */
    resourceId: string;
    /**
     * Friendly name recorded on the association. If omitted, a unique name
     * is generated. Associations cannot be renamed, so changing it forces
     * replacement.
     */
    name?: string;
}
export interface ProfileAssociation extends Resource<"AWS.Route53Profiles.ProfileAssociation", ProfileAssociationProps, {
    /** ID of the association (e.g. `rpassoc-...`). */
    profileAssociationId: string;
    /** ID of the associated Profile. */
    profileId: string;
    /** ID of the associated VPC. */
    resourceId: string;
    /** Name recorded on the association. */
    name: string;
    /**
     * Status of the association at the end of the deploy. Associations
     * complete asynchronously (typically within a couple of minutes), so
     * this is usually `CREATING`; the Profile's DNS settings take effect in
     * the VPC once the association reaches `COMPLETE`.
     */
    status: profiles.ProfileStatus;
}, never, Providers> {
}
/**
 * An association between a Route 53 Profile and a VPC. Once the association
 * completes, every DNS resource attached to the Profile (private hosted
 * zones, Resolver rules, DNS Firewall rule groups) takes effect in the VPC.
 *
 * A VPC can have only one Profile associated with it; a Profile can be
 * associated with thousands of VPCs. The association is created immediately
 * but completes asynchronously — the returned `status` is typically still
 * `CREATING` when the deploy finishes.
 * ### Associating a Profile
 * **Example:** Apply a Profile to a VPC
 * ```typescript
 * import * as Route53Profiles from "alchemy/AWS/Route53Profiles";
 *
 * const association = yield* Route53Profiles.ProfileAssociation("AppVpcDns", {
 *   profileId: profile.profileId,
 *   resourceId: vpc.vpcId,
 * });
 * ```
 *
 * @resource
 */
export declare const ProfileAssociation: import("../../Resource.ts").ResourceClass<ProfileAssociation>;
export declare const ProfileAssociationProvider: () => import("effect/Layer").Layer<Provider.Provider<ProfileAssociation>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ProfileAssociation.d.ts.map