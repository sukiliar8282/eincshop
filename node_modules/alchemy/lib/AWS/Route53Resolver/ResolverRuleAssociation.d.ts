import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ResolverRuleAssociationProps {
    /**
     * ID of the resolver rule to attach. Changing it forces replacement.
     */
    resolverRuleId: string;
    /**
     * ID of the VPC the rule takes effect in. Changing it forces
     * replacement.
     */
    vpcId: string;
    /**
     * Optional friendly name recorded on the association. Changing it forces
     * replacement (associations cannot be updated).
     */
    name?: string;
}
export interface ResolverRuleAssociation extends Resource<"AWS.Route53Resolver.ResolverRuleAssociation", ResolverRuleAssociationProps, {
    /**
     * ID of the association (e.g. `rslvr-rrassoc-...`).
     */
    resolverRuleAssociationId: string;
    /**
     * ID of the associated resolver rule.
     */
    resolverRuleId: string;
    /**
     * ID of the VPC the rule is associated with.
     */
    vpcId: string;
}, never, Providers> {
}
/**
 * An association between a Route 53 Resolver rule and a VPC. Once
 * associated, Resolver applies the rule to DNS queries that originate in
 * that VPC.
 * ### Associating Rules
 * **Example:** Attach a Forwarding Rule to a VPC
 * ```typescript
 * import * as Route53Resolver from "alchemy/AWS/Route53Resolver";
 *
 * const association = yield* Route53Resolver.ResolverRuleAssociation(
 *   "CorpForwardAssoc",
 *   {
 *     resolverRuleId: rule.resolverRuleId,
 *     vpcId: vpc.vpcId,
 *   },
 * );
 * ```
 *
 * @resource
 */
export declare const ResolverRuleAssociation: import("../../Resource.ts").ResourceClass<ResolverRuleAssociation>;
export declare const ResolverRuleAssociationProvider: () => import("effect/Layer").Layer<Provider.Provider<ResolverRuleAssociation>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ResolverRuleAssociation.d.ts.map