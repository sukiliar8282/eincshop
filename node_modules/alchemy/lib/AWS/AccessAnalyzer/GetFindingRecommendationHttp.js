import * as aa from "@distilled.cloud/aws/accessanalyzer";
import * as Layer from "effect/Layer";
import { makeAnalyzerScopedHttpBinding } from "./BindingHttp.js";
import { GetFindingRecommendation } from "./GetFindingRecommendation.js";
export const GetFindingRecommendationHttp = Layer.effect(GetFindingRecommendation, makeAnalyzerScopedHttpBinding({
    tag: "AWS.AccessAnalyzer.GetFindingRecommendation",
    operation: aa.getFindingRecommendation,
    actions: ["access-analyzer:GetFindingRecommendation"],
}));
//# sourceMappingURL=GetFindingRecommendationHttp.js.map