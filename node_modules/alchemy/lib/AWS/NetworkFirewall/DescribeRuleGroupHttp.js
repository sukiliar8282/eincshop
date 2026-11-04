import * as nfw from "@distilled.cloud/aws/network-firewall";
import * as Layer from "effect/Layer";
import { makeNetworkFirewallRuleGroupHttpBinding } from "./BindingHttp.js";
import { DescribeRuleGroup } from "./DescribeRuleGroup.js";
export const DescribeRuleGroupHttp = Layer.effect(DescribeRuleGroup, makeNetworkFirewallRuleGroupHttpBinding({
    tag: "AWS.NetworkFirewall.DescribeRuleGroup",
    operation: nfw.describeRuleGroup,
    actions: ["network-firewall:DescribeRuleGroup"],
}));
//# sourceMappingURL=DescribeRuleGroupHttp.js.map