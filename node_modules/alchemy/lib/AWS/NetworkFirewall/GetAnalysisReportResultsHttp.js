import * as nfw from "@distilled.cloud/aws/network-firewall";
import * as Layer from "effect/Layer";
import { makeNetworkFirewallFirewallHttpBinding } from "./BindingHttp.js";
import { GetAnalysisReportResults } from "./GetAnalysisReportResults.js";
export const GetAnalysisReportResultsHttp = Layer.effect(GetAnalysisReportResults, makeNetworkFirewallFirewallHttpBinding({
    tag: "AWS.NetworkFirewall.GetAnalysisReportResults",
    operation: nfw.getAnalysisReportResults,
    actions: ["network-firewall:GetAnalysisReportResults"],
}));
//# sourceMappingURL=GetAnalysisReportResultsHttp.js.map