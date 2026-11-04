import * as profiles from "@distilled.cloud/aws/route53profiles";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ProfileResourceAssociationProps {
    /**
     * ID of the Route 53 Profile to attach the resource to. Changing it
     * forces replacement.
     */
    profileId: string;
    /**
     * ARN of the DNS resource to attach — a private hosted zone, Resolver
     * rule, or DNS Firewall rule group. Changing it forces replacement.
     */
    resourceArn: string;
    /**
     * Friendly name recorded on the association. If omitted, a unique name
     * is generated. Names can be updated in place.
     */
    name?: string;
    /**
     * Resource-specific configuration, as a JSON string. DNS Firewall rule
     * group associations require a priority, e.g.
     * `JSON.stringify({ priority: 102 })`. Updated in place.
     */
    resourceProperties?: string;
}
export interface ProfileResourceAssociation extends Resource<"AWS.Route53Profiles.ProfileResourceAssociation", ProfileResourceAssociationProps, {
    /** ID of the association (e.g. `rpr-...`). */
    profileResourceAssociationId: string;
    /** ID of the Profile. */
    profileId: string;
    /** ARN of the attached DNS resource. */
    resourceArn: string;
    /** Type of the attached resource (e.g. `FIREWALL_RULE_GROUP`). */
    resourceType: string;
    /** Name recorded on the association. */
    name: string;
    /** Resource-specific configuration JSON, if any. */
    resourceProperties: string | undefined;
    /**
     * Status of the association at the end of the deploy. Associations
     * settle asynchronously (typically within a minute or two), so this is
     * usually still `UPDATING`.
     */
    status: profiles.ProfileStatus;
}, never, Providers> {
}
/**
 * An attachment of a DNS resource to a Route 53 Profile. Attach private
 * hosted zones, Resolver rules, or DNS Firewall rule groups; every VPC the
 * Profile is associated with picks up the resource.
 * ### Attaching Resources
 * **Example:** Attach a DNS Firewall Rule Group
 * ```typescript
 * import * as Route53Profiles from "alchemy/AWS/Route53Profiles";
 *
 * const attachment = yield* Route53Profiles.ProfileResourceAssociation(
 *   "FirewallRules",
 *   {
 *     profileId: profile.profileId,
 *     resourceArn: ruleGroupArn,
 *     resourceProperties: JSON.stringify({ priority: 102 }),
 *   },
 * );
 * ```
 *
 * **Example:** Attach a Resolver Rule
 * ```typescript
 * const attachment = yield* Route53Profiles.ProfileResourceAssociation(
 *   "CorpForwarding",
 *   {
 *     profileId: profile.profileId,
 *     resourceArn: rule.resolverRuleArn,
 *   },
 * );
 * ```
 *
 * @resource
 */
export declare const ProfileResourceAssociation: import("../../Resource.ts").ResourceClass<ProfileResourceAssociation>;
export declare const ProfileResourceAssociationProvider: () => import("effect/Layer").Layer<Provider.Provider<ProfileResourceAssociation>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ProfileResourceAssociation.d.ts.map