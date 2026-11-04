import * as nfw from "@distilled.cloud/aws/network-firewall";
import * as Layer from "effect/Layer";
import { makeNetworkFirewallFirewallHttpBinding } from "./BindingHttp.js";
import { ListAnalysisReports } from "./ListAnalysisReports.js";
export const ListAnalysisReportsHttp = Layer.effect(ListAnalysisReports, makeNetworkFirewallFirewallHttpBinding({
    tag: "AWS.NetworkFirewall.ListAnalysisReports",
    operation: nfw.listAnalysisReports,
    actions: ["network-firewall:ListAnalysisReports"],
}));
//# sourceMappingURL=ListAnalysisReportsHttp.js.map