import * as ce from "@distilled.cloud/aws/cost-explorer";
import * as Layer from "effect/Layer";
import { makeCostExplorerHttpBinding } from "./BindingHttp.js";
import { GetSavingsPlanPurchaseRecommendationDetails } from "./GetSavingsPlanPurchaseRecommendationDetails.js";
export const GetSavingsPlanPurchaseRecommendationDetailsHttp = Layer.effect(GetSavingsPlanPurchaseRecommendationDetails, makeCostExplorerHttpBinding({
    capability: "GetSavingsPlanPurchaseRecommendationDetails",
    iamActions: ["ce:GetSavingsPlanPurchaseRecommendationDetails"],
    operation: ce.getSavingsPlanPurchaseRecommendationDetails,
}));
//# sourceMappingURL=GetSavingsPlanPurchaseRecommendationDetailsHttp.js.map