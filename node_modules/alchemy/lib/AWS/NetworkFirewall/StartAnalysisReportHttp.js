import * as nfw from "@distilled.cloud/aws/network-firewall";
import * as Layer from "effect/Layer";
import { makeNetworkFirewallFirewallHttpBinding } from "./BindingHttp.js";
import { StartAnalysisReport } from "./StartAnalysisReport.js";
export const StartAnalysisReportHttp = Layer.effect(StartAnalysisReport, makeNetworkFirewallFirewallHttpBinding({
    tag: "AWS.NetworkFirewall.StartAnalysisReport",
    operation: nfw.startAnalysisReport,
    actions: ["network-firewall:StartAnalysisReport"],
}));
//# sourceMappingURL=StartAnalysisReportHttp.js.map