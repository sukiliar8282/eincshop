import * as config from "@distilled.cloud/aws/config-service";
import * as Layer from "effect/Layer";
import { makeConfigResourceHttpBinding } from "./BindingHttp.js";
import { GetComplianceDetailsByConfigRule } from "./GetComplianceDetailsByConfigRule.js";
export const GetComplianceDetailsByConfigRuleHttp = Layer.effect(GetComplianceDetailsByConfigRule, makeConfigResourceHttpBinding({
    tag: "AWS.Config.GetComplianceDetailsByConfigRule",
    operation: config.getComplianceDetailsByConfigRule,
    actions: ["config:GetComplianceDetailsByConfigRule"],
    requestKey: "ConfigRuleName",
    identifier: (rule) => rule.configRuleName,
}));
//# sourceMappingURL=GetComplianceDetailsByConfigRuleHttp.js.map