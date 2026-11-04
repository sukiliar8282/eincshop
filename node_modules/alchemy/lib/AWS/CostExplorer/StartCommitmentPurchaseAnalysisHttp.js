import * as ce from "@distilled.cloud/aws/cost-explorer";
import * as Layer from "effect/Layer";
import { makeCostExplorerHttpBinding } from "./BindingHttp.js";
import { StartCommitmentPurchaseAnalysis } from "./StartCommitmentPurchaseAnalysis.js";
export const StartCommitmentPurchaseAnalysisHttp = Layer.effect(StartCommitmentPurchaseAnalysis, makeCostExplorerHttpBinding({
    capability: "StartCommitmentPurchaseAnalysis",
    iamActions: ["ce:StartCommitmentPurchaseAnalysis"],
    operation: ce.startCommitmentPurchaseAnalysis,
}));
//# sourceMappingURL=StartCommitmentPurchaseAnalysisHttp.js.map