import * as ce from "@distilled.cloud/aws/cost-explorer";
import * as Layer from "effect/Layer";
import { makeCostExplorerHttpBinding } from "./BindingHttp.js";
import { GetReservationPurchaseRecommendation } from "./GetReservationPurchaseRecommendation.js";
export const GetReservationPurchaseRecommendationHttp = Layer.effect(GetReservationPurchaseRecommendation, makeCostExplorerHttpBinding({
    capability: "GetReservationPurchaseRecommendation",
    iamActions: ["ce:GetReservationPurchaseRecommendation"],
    operation: ce.getReservationPurchaseRecommendation,
}));
//# sourceMappingURL=GetReservationPurchaseRecommendationHttp.js.map