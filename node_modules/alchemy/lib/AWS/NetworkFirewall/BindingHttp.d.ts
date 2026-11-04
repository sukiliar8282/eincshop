import * as Effect from "effect/Effect";
import type { Firewall } from "./Firewall.ts";
import type { FirewallPolicy } from "./FirewallPolicy.ts";
import type { RuleGroup } from "./RuleGroup.ts";
/**
 * Shared scaffolding for AWS Network Firewall HTTP bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the three
 * builders below. Everything except the operation and the IAM action is
 * boilerplate:
 *
 * - {@link makeNetworkFirewallFirewallHttpBinding} — operations scoped to one
 *   bound {@link Firewall} (`DescribeFirewall`, the flow-operation interface,
 *   the analysis-report interface). The runtime callable injects the
 *   firewall's ARN as the request's `FirewallArn`; the deploy-time half
 *   grants `actions` on the firewall ARN.
 * - {@link makeNetworkFirewallFirewallPolicyHttpBinding} — operations scoped
 *   to one bound {@link FirewallPolicy}; injects `FirewallPolicyArn`.
 * - {@link makeNetworkFirewallRuleGroupHttpBinding} — operations scoped to
 *   one bound {@link RuleGroup}; injects `RuleGroupArn`.
 */
/**
 * Build the impl Effect for an operation scoped to a single bound
 * {@link Firewall}. The runtime callable injects the firewall's ARN as the
 * request's `FirewallArn`; the deploy-time half grants `actions` on the
 * firewall ARN.
 */
export declare const makeNetworkFirewallFirewallHttpBinding: <I extends {
    FirewallArn?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.NetworkFirewall.StartFlowCapture`. */
    tag: string;
    /** The distilled operation; `FirewallArn` is injected from the resource. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the firewall ARN. */
    actions: readonly string[];
}) => Effect.Effect<(firewall: Firewall) => Effect.Effect<(request?: Omit<I, "FirewallArn" | "FirewallName"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an operation scoped to a single bound
 * {@link FirewallPolicy}. The runtime callable injects the policy's ARN as
 * the request's `FirewallPolicyArn`; the deploy-time half grants `actions`
 * on the policy ARN.
 */
export declare const makeNetworkFirewallFirewallPolicyHttpBinding: <I extends {
    FirewallPolicyArn?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.NetworkFirewall.DescribeFirewallPolicy`. */
    tag: string;
    /** The distilled operation; `FirewallPolicyArn` is injected from the resource. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the firewall policy ARN. */
    actions: readonly string[];
}) => Effect.Effect<(policy: FirewallPolicy) => Effect.Effect<(request?: Omit<I, "FirewallPolicyArn" | "FirewallPolicyName"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an operation scoped to a single bound
 * {@link RuleGroup}. The runtime callable injects the rule group's ARN as
 * the request's `RuleGroupArn`; the deploy-time half grants `actions` on the
 * rule group ARN.
 */
export declare const makeNetworkFirewallRuleGroupHttpBinding: <I extends {
    RuleGroupArn?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.NetworkFirewall.DescribeRuleGroup`. */
    tag: string;
    /** The distilled operation; `RuleGroupArn` is injected from the resource. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the rule group ARN. */
    actions: readonly string[];
}) => Effect.Effect<(ruleGroup: RuleGroup) => Effect.Effect<(request?: Omit<I, "RuleGroupArn" | "RuleGroupName" | "Type"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map