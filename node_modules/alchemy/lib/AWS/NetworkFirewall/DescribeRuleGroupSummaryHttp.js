import * as nfw from "@distilled.cloud/aws/network-firewall";
import * as Layer from "effect/Layer";
import { makeNetworkFirewallRuleGroupHttpBinding } from "./BindingHttp.js";
import { DescribeRuleGroupSummary } from "./DescribeRuleGroupSummary.js";
export const DescribeRuleGroupSummaryHttp = Layer.effect(DescribeRuleGroupSummary, makeNetworkFirewallRuleGroupHttpBinding({
    tag: "AWS.NetworkFirewall.DescribeRuleGroupSummary",
    operation: nfw.describeRuleGroupSummary,
    actions: ["network-firewall:DescribeRuleGroupSummary"],
}));
//# sourceMappingURL=DescribeRuleGroupSummaryHttp.js.map