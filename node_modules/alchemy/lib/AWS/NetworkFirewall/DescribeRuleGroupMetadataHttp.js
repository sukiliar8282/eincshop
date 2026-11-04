import * as nfw from "@distilled.cloud/aws/network-firewall";
import * as Layer from "effect/Layer";
import { makeNetworkFirewallRuleGroupHttpBinding } from "./BindingHttp.js";
import { DescribeRuleGroupMetadata } from "./DescribeRuleGroupMetadata.js";
export const DescribeRuleGroupMetadataHttp = Layer.effect(DescribeRuleGroupMetadata, makeNetworkFirewallRuleGroupHttpBinding({
    tag: "AWS.NetworkFirewall.DescribeRuleGroupMetadata",
    operation: nfw.describeRuleGroupMetadata,
    actions: ["network-firewall:DescribeRuleGroupMetadata"],
}));
//# sourceMappingURL=DescribeRuleGroupMetadataHttp.js.map