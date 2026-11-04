import * as ce from "@distilled.cloud/aws/cost-explorer";
import * as Layer from "effect/Layer";
import { makeCostExplorerHttpBinding } from "./BindingHttp.js";
import { GetCommitmentPurchaseAnalysis } from "./GetCommitmentPurchaseAnalysis.js";
export const GetCommitmentPurchaseAnalysisHttp = Layer.effect(GetCommitmentPurchaseAnalysis, makeCostExplorerHttpBinding({
    capability: "GetCommitmentPurchaseAnalysis",
    iamActions: ["ce:GetCommitmentPurchaseAnalysis"],
    operation: ce.getCommitmentPurchaseAnalysis,
}));
//# sourceMappingURL=GetCommitmentPurchaseAnalysisHttp.js.map