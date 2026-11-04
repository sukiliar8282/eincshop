import * as ce from "@distilled.cloud/aws/cost-explorer";
import * as Layer from "effect/Layer";
import { makeCostExplorerHttpBinding } from "./BindingHttp.js";
import { GetSavingsPlansPurchaseRecommendation } from "./GetSavingsPlansPurchaseRecommendation.js";
export const GetSavingsPlansPurchaseRecommendationHttp = Layer.effect(GetSavingsPlansPurchaseRecommendation, makeCostExplorerHttpBinding({
    capability: "GetSavingsPlansPurchaseRecommendation",
    iamActions: ["ce:GetSavingsPlansPurchaseRecommendation"],
    operation: ce.getSavingsPlansPurchaseRecommendation,
}));
//# sourceMappingURL=GetSavingsPlansPurchaseRecommendationHttp.js.map