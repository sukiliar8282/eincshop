import * as ce from "@distilled.cloud/aws/cost-explorer";
import * as Layer from "effect/Layer";
import { makeCostExplorerHttpBinding } from "./BindingHttp.js";
import { ListCommitmentPurchaseAnalyses } from "./ListCommitmentPurchaseAnalyses.js";
export const ListCommitmentPurchaseAnalysesHttp = Layer.effect(ListCommitmentPurchaseAnalyses, makeCostExplorerHttpBinding({
    capability: "ListCommitmentPurchaseAnalyses",
    iamActions: ["ce:ListCommitmentPurchaseAnalyses"],
    operation: ce.listCommitmentPurchaseAnalyses,
}));
//# sourceMappingURL=ListCommitmentPurchaseAnalysesHttp.js.map