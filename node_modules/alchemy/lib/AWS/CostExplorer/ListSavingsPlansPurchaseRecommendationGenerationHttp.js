import * as ce from "@distilled.cloud/aws/cost-explorer";
import * as Layer from "effect/Layer";
import { makeCostExplorerHttpBinding } from "./BindingHttp.js";
import { ListSavingsPlansPurchaseRecommendationGeneration } from "./ListSavingsPlansPurchaseRecommendationGeneration.js";
export const ListSavingsPlansPurchaseRecommendationGenerationHttp = Layer.effect(ListSavingsPlansPurchaseRecommendationGeneration, makeCostExplorerHttpBinding({
    capability: "ListSavingsPlansPurchaseRecommendationGeneration",
    iamActions: ["ce:ListSavingsPlansPurchaseRecommendationGeneration"],
    operation: ce.listSavingsPlansPurchaseRecommendationGeneration,
}));
//# sourceMappingURL=ListSavingsPlansPurchaseRecommendationGenerationHttp.js.map