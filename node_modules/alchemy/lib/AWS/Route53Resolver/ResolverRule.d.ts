import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ResolverRuleTargetIp {
    /**
     * IPv4 address of the DNS resolver on your network that queries are
     * forwarded to.
     */
    ip?: string;
    /**
     * IPv6 address of the DNS resolver on your network.
     */
    ipv6?: string;
    /**
     * Port the target resolver listens on.
     * @default 53
     */
    port?: number;
    /**
     * Protocol used to reach the target.
     * @default "Do53"
     */
    protocol?: "Do53" | "DoH";
}
export interface ResolverRuleProps {
    /**
     * Friendly name of the rule. Also used as the `CreatorRequestId`.
     * Changing it forces replacement.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * How Resolver handles queries for `domainName`. Only `FORWARD` rules
     * can carry `targetIps`. Changing it forces replacement.
     * @default "FORWARD"
     */
    ruleType?: "FORWARD" | "SYSTEM" | "RECURSIVE" | "DELEGATE";
    /**
     * Domain name that DNS queries are matched against (longest suffix
     * match). Changing it forces replacement.
     */
    domainName: string;
    /**
     * IP addresses of the DNS resolvers on your network that matching
     * queries are forwarded to. Updatable in place.
     */
    targetIps?: ResolverRuleTargetIp[];
    /**
     * ID of the OUTBOUND resolver endpoint the forwarded queries pass
     * through. Updatable in place.
     */
    resolverEndpointId?: string;
    /**
     * Tags to apply to the rule. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface ResolverRule extends Resource<"AWS.Route53Resolver.ResolverRule", ResolverRuleProps, {
    /**
     * ID of the resolver rule (e.g. `rslvr-rr-...`).
     */
    resolverRuleId: string;
    /**
     * ARN of the resolver rule.
     */
    resolverRuleArn: string;
    /**
     * Name of the rule.
     */
    name: string;
    /**
     * Domain name the rule matches (as stored by Route 53 Resolver, with a
     * trailing dot).
     */
    domainName: string;
}, never, Providers> {
}
/**
 * A Route 53 Resolver rule — tells Resolver how to handle DNS queries for a
 * domain that originate in your VPCs.
 *
 * A `FORWARD` rule sends matching queries through an OUTBOUND
 * `ResolverEndpoint` to the DNS resolvers on your network listed in
 * `targetIps`. The rule takes effect in a VPC once attached with a
 * `ResolverRuleAssociation`.
 * ### Forwarding Rules
 * **Example:** Forward a Domain to On-Prem Resolvers
 * ```typescript
 * import * as Route53Resolver from "alchemy/AWS/Route53Resolver";
 *
 * const rule = yield* Route53Resolver.ResolverRule("CorpForward", {
 *   domainName: "corp.example.com",
 *   resolverEndpointId: outbound.resolverEndpointId,
 *   targetIps: [{ ip: "192.168.1.10" }, { ip: "192.168.1.11", port: 53 }],
 * });
 * ```
 *
 * ### Attaching to VPCs
 * **Example:** Associate the Rule with a VPC
 * ```typescript
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
export declare const ResolverRule: import("../../Resource.ts").ResourceClass<ResolverRule>;
export declare const ResolverRuleProvider: () => import("effect/Layer").Layer<Provider.Provider<ResolverRule>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ResolverRule.d.ts.map