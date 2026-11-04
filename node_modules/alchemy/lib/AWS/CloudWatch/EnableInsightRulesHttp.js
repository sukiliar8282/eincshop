import * as cloudwatch from "@distilled.cloud/aws/cloudwatch";
import * as Layer from "effect/Layer";
import { makeCloudWatchResourceSetHttpBinding } from "./BindingHttp.js";
import { EnableInsightRules } from "./EnableInsightRules.js";
export const EnableInsightRulesHttp = Layer.effect(EnableInsightRules, makeCloudWatchResourceSetHttpBinding({
    tag: "AWS.CloudWatch.EnableInsightRules",
    operation: cloudwatch.enableInsightRules,
    action: "cloudwatch:EnableInsightRules",
    namesKey: "RuleNames",
    name: (rule) => rule.ruleName,
    arn: (rule) => rule.ruleArn,
}));
//# sourceMappingURL=EnableInsightRulesHttp.js.map