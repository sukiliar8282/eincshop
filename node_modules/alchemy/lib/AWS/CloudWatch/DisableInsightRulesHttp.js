import * as cloudwatch from "@distilled.cloud/aws/cloudwatch";
import * as Layer from "effect/Layer";
import { makeCloudWatchResourceSetHttpBinding } from "./BindingHttp.js";
import { DisableInsightRules } from "./DisableInsightRules.js";
export const DisableInsightRulesHttp = Layer.effect(DisableInsightRules, makeCloudWatchResourceSetHttpBinding({
    tag: "AWS.CloudWatch.DisableInsightRules",
    operation: cloudwatch.disableInsightRules,
    action: "cloudwatch:DisableInsightRules",
    namesKey: "RuleNames",
    name: (rule) => rule.ruleName,
    arn: (rule) => rule.ruleArn,
}));
//# sourceMappingURL=DisableInsightRulesHttp.js.map