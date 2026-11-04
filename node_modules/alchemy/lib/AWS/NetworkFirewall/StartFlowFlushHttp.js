import * as nfw from "@distilled.cloud/aws/network-firewall";
import * as Layer from "effect/Layer";
import { makeNetworkFirewallFirewallHttpBinding } from "./BindingHttp.js";
import { StartFlowFlush } from "./StartFlowFlush.js";
export const StartFlowFlushHttp = Layer.effect(StartFlowFlush, makeNetworkFirewallFirewallHttpBinding({
    tag: "AWS.NetworkFirewall.StartFlowFlush",
    operation: nfw.startFlowFlush,
    actions: ["network-firewall:StartFlowFlush"],
}));
//# sourceMappingURL=StartFlowFlushHttp.js.map