import * as config from "@distilled.cloud/aws/config-service";
import * as Layer from "effect/Layer";
import { makeConfigAccountHttpBinding } from "./BindingHttp.js";
import { GetComplianceSummaryByConfigRule } from "./GetComplianceSummaryByConfigRule.js";
export const GetComplianceSummaryByConfigRuleHttp = Layer.effect(GetComplianceSummaryByConfigRule, makeConfigAccountHttpBinding({
    tag: "AWS.Config.GetComplianceSummaryByConfigRule",
    operation: config.getComplianceSummaryByConfigRule,
    actions: ["config:GetComplianceSummaryByConfigRule"],
}));
//# sourceMappingURL=GetComplianceSummaryByConfigRuleHttp.js.map