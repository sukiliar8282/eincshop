import * as ce from "@distilled.cloud/aws/cost-explorer";
import * as Layer from "effect/Layer";
import { makeCostExplorerHttpBinding } from "./BindingHttp.js";
import { GetCostComparisonDrivers } from "./GetCostComparisonDrivers.js";
export const GetCostComparisonDriversHttp = Layer.effect(GetCostComparisonDrivers, makeCostExplorerHttpBinding({
    capability: "GetCostComparisonDrivers",
    iamActions: ["ce:GetCostComparisonDrivers"],
    operation: ce.getCostComparisonDrivers,
}));
//# sourceMappingURL=GetCostComparisonDriversHttp.js.map