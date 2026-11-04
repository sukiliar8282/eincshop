import * as ce from "@distilled.cloud/aws/cost-explorer";
import * as Layer from "effect/Layer";
import { makeCostExplorerHttpBinding } from "./BindingHttp.js";
import { GetRightsizingRecommendation } from "./GetRightsizingRecommendation.js";
export const GetRightsizingRecommendationHttp = Layer.effect(GetRightsizingRecommendation, makeCostExplorerHttpBinding({
    capability: "GetRightsizingRecommendation",
    iamActions: ["ce:GetRightsizingRecommendation"],
    operation: ce.getRightsizingRecommendation,
}));
//# sourceMappingURL=GetRightsizingRecommendationHttp.js.map