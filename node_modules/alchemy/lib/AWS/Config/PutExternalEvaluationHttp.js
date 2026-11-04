import * as config from "@distilled.cloud/aws/config-service";
import * as Layer from "effect/Layer";
import { makeConfigResourceHttpBinding } from "./BindingHttp.js";
import { PutExternalEvaluation } from "./PutExternalEvaluation.js";
export const PutExternalEvaluationHttp = Layer.effect(PutExternalEvaluation, makeConfigResourceHttpBinding({
    tag: "AWS.Config.PutExternalEvaluation",
    operation: config.putExternalEvaluation,
    actions: ["config:PutExternalEvaluation"],
    requestKey: "ConfigRuleName",
    identifier: (rule) => rule.configRuleName,
}));
//# sourceMappingURL=PutExternalEvaluationHttp.js.map