import * as nfw from "@distilled.cloud/aws/network-firewall";
import * as Layer from "effect/Layer";
import { makeNetworkFirewallFirewallHttpBinding } from "./BindingHttp.js";
import { StartFlowCapture } from "./StartFlowCapture.js";
export const StartFlowCaptureHttp = Layer.effect(StartFlowCapture, makeNetworkFirewallFirewallHttpBinding({
    tag: "AWS.NetworkFirewall.StartFlowCapture",
    operation: nfw.startFlowCapture,
    actions: ["network-firewall:StartFlowCapture"],
}));
//# sourceMappingURL=StartFlowCaptureHttp.js.map