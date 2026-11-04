import * as ce from "@distilled.cloud/aws/cost-explorer";
import * as Layer from "effect/Layer";
import { makeCostExplorerHttpBinding } from "./BindingHttp.js";
import { GetCostAndUsage } from "./GetCostAndUsage.js";
export const GetCostAndUsageHttp = Layer.effect(GetCostAndUsage, makeCostExplorerHttpBinding({
    capability: "GetCostAndUsage",
    iamActions: ["ce:GetCostAndUsage"],
    operation: ce.getCostAndUsage,
}));
//# sourceMappingURL=GetCostAndUsageHttp.js.map