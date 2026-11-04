import * as cloudwatch from "@distilled.cloud/aws/cloudwatch";
import * as Layer from "effect/Layer";
import { makeCloudWatchResourceHttpBinding } from "./BindingHttp.js";
import { GetInsightRuleReport } from "./GetInsightRuleReport.js";
export const GetInsightRuleReportHttp = Layer.effect(GetInsightRuleReport, makeCloudWatchResourceHttpBinding({
    tag: "AWS.CloudWatch.GetInsightRuleReport",
    operation: cloudwatch.getInsightRuleReport,
    actions: ["cloudwatch:GetInsightRuleReport"],
    requestKey: "RuleName",
    identifier: (rule) => rule.ruleName,
    resourceArn: (rule) => rule.ruleArn,
}));
//# sourceMappingURL=GetInsightRuleReportHttp.js.map