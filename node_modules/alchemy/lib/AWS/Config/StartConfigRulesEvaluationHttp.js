import * as config from "@distilled.cloud/aws/config-service";
import * as Layer from "effect/Layer";
import { makeConfigResourceHttpBinding } from "./BindingHttp.js";
import { StartConfigRulesEvaluation } from "./StartConfigRulesEvaluation.js";
export const StartConfigRulesEvaluationHttp = Layer.effect(StartConfigRulesEvaluation, makeConfigResourceHttpBinding({
    tag: "AWS.Config.StartConfigRulesEvaluation",
    operation: config.startConfigRulesEvaluation,
    actions: ["config:StartConfigRulesEvaluation"],
    requestKey: "ConfigRuleNames",
    asList: true,
    identifier: (rule) => rule.configRuleName,
}));
//# sourceMappingURL=StartConfigRulesEvaluationHttp.js.map