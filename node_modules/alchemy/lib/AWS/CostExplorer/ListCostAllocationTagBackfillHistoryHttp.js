import * as ce from "@distilled.cloud/aws/cost-explorer";
import * as Layer from "effect/Layer";
import { makeCostExplorerHttpBinding } from "./BindingHttp.js";
import { ListCostAllocationTagBackfillHistory } from "./ListCostAllocationTagBackfillHistory.js";
export const ListCostAllocationTagBackfillHistoryHttp = Layer.effect(ListCostAllocationTagBackfillHistory, makeCostExplorerHttpBinding({
    capability: "ListCostAllocationTagBackfillHistory",
    iamActions: ["ce:ListCostAllocationTagBackfillHistory"],
    operation: ce.listCostAllocationTagBackfillHistory,
}));
//# sourceMappingURL=ListCostAllocationTagBackfillHistoryHttp.js.map