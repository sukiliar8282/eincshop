import * as nfw from "@distilled.cloud/aws/network-firewall";
import * as Layer from "effect/Layer";
import { makeNetworkFirewallFirewallHttpBinding } from "./BindingHttp.js";
import { ListFlowOperations } from "./ListFlowOperations.js";
export const ListFlowOperationsHttp = Layer.effect(ListFlowOperations, makeNetworkFirewallFirewallHttpBinding({
    tag: "AWS.NetworkFirewall.ListFlowOperations",
    operation: nfw.listFlowOperations,
    actions: ["network-firewall:ListFlowOperations"],
}));
//# sourceMappingURL=ListFlowOperationsHttp.js.map