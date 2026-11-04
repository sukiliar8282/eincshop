import * as personalizeruntime from "@distilled.cloud/aws/personalize-runtime";
import * as Layer from "effect/Layer";
import { makePersonalizeAccountHttpBinding } from "./BindingHttp.js";
import { GetRecommendations } from "./GetRecommendations.js";
export const GetRecommendationsHttp = Layer.effect(GetRecommendations, makePersonalizeAccountHttpBinding({
    tag: "AWS.Personalize.GetRecommendations",
    operation: personalizeruntime.getRecommendations,
    actions: ["personalize:GetRecommendations"],
}));
//# sourceMappingURL=GetRecommendationsHttp.js.map