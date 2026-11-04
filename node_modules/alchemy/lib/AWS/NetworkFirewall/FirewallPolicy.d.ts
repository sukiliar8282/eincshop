import type * as NFW from "@distilled.cloud/aws/network-firewall";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface FirewallPolicyProps {
    /**
     * Name of the firewall policy. Must be 1-128 alphanumeric characters or
     * hyphens. If omitted, a deterministic physical name is generated.
     * Changing the name replaces the policy.
     */
    firewallPolicyName?: string;
    /**
     * The policy definition: stateless/stateful rule group references,
     * default actions, and engine options. Uses raw Network Firewall API
     * structures. `StatelessDefaultActions` and
     * `StatelessFragmentDefaultActions` are required.
     */
    firewallPolicy: NFW.FirewallPolicy;
    /**
     * Human-readable description of the firewall policy.
     */
    description?: string;
    /**
     * Tags to apply to the policy. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface FirewallPolicy extends Resource<"AWS.NetworkFirewall.FirewallPolicy", FirewallPolicyProps, {
    /** Name of the firewall policy. */
    firewallPolicyName: string;
    /** ARN of the firewall policy. */
    firewallPolicyArn: string;
    /** Server-assigned unique id of the firewall policy. */
    firewallPolicyId: string;
}, never, Providers> {
}
/**
 * An AWS Network Firewall policy — defines a firewall's traffic inspection
 * behavior as a collection of stateless and stateful
 * {@link RuleGroup | rule group} references plus default actions. One policy
 * can be shared by multiple {@link Firewall | firewalls}.
 * ### Creating Policies
 * **Example:** Pass-everything Policy
 * ```typescript
 * import * as NetworkFirewall from "alchemy/AWS/NetworkFirewall";
 *
 * const policy = yield* NetworkFirewall.FirewallPolicy("Policy", {
 *   firewallPolicy: {
 *     StatelessDefaultActions: ["aws:pass"],
 *     StatelessFragmentDefaultActions: ["aws:pass"],
 *   },
 * });
 * ```
 *
 * **Example:** Policy referencing Rule Groups
 * ```typescript
 * const stateless = yield* NetworkFirewall.RuleGroup("Stateless", {
 *   type: "STATELESS",
 *   capacity: 10,
 *   ruleGroup: { ... },
 * });
 *
 * const policy = yield* NetworkFirewall.FirewallPolicy("Policy", {
 *   firewallPolicy: {
 *     StatelessDefaultActions: ["aws:forward_to_sfe"],
 *     StatelessFragmentDefaultActions: ["aws:forward_to_sfe"],
 *     StatelessRuleGroupReferences: [
 *       { ResourceArn: stateless.ruleGroupArn, Priority: 1 },
 *     ],
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const FirewallPolicy: import("../../Resource.ts").ResourceClass<FirewallPolicy>;
export declare const FirewallPolicyProvider: () => import("effect/Layer").Layer<Provider.Provider<FirewallPolicy>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=FirewallPolicy.d.ts.map