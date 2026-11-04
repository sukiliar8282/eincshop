import * as ce from "@distilled.cloud/aws/cost-explorer";
import * as Layer from "effect/Layer";
import { makeCostExplorerHttpBinding } from "./BindingHttp.js";
import { StartSavingsPlansPurchaseRecommendationGeneration } from "./StartSavingsPlansPurchaseRecommendationGeneration.js";
export const StartSavingsPlansPurchaseRecommendationGenerationHttp = Layer.effect(StartSavingsPlansPurchaseRecommendationGeneration, makeCostExplorerHttpBinding({
    capability: "StartSavingsPlansPurchaseRecommendationGeneration",
    iamActions: ["ce:StartSavingsPlansPurchaseRecommendationGeneration"],
    operation: ce.startSavingsPlansPurchaseRecommendationGeneration,
}));
//# sourceMappingURL=StartSavingsPlansPurchaseRecommendationGenerationHttp.js.map