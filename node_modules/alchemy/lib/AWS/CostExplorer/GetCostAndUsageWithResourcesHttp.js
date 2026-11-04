import * as ce from "@distilled.cloud/aws/cost-explorer";
import * as Layer from "effect/Layer";
import { makeCostExplorerHttpBinding } from "./BindingHttp.js";
import { GetCostAndUsageWithResources } from "./GetCostAndUsageWithResources.js";
export const GetCostAndUsageWithResourcesHttp = Layer.effect(GetCostAndUsageWithResources, makeCostExplorerHttpBinding({
    capability: "GetCostAndUsageWithResources",
    iamActions: ["ce:GetCostAndUsageWithResources"],
    operation: ce.getCostAndUsageWithResources,
}));
//# sourceMappingURL=GetCostAndUsageWithResourcesHttp.js.map