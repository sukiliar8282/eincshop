import * as config from "@distilled.cloud/aws/config-service";
import * as Layer from "effect/Layer";
import { makeConfigAccountHttpBinding } from "./BindingHttp.js";
import { GetResourceEvaluationSummary } from "./GetResourceEvaluationSummary.js";
export const GetResourceEvaluationSummaryHttp = Layer.effect(GetResourceEvaluationSummary, makeConfigAccountHttpBinding({
    tag: "AWS.Config.GetResourceEvaluationSummary",
    operation: config.getResourceEvaluationSummary,
    actions: ["config:GetResourceEvaluationSummary"],
}));
//# sourceMappingURL=GetResourceEvaluationSummaryHttp.js.map