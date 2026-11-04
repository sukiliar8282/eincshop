import * as ce from "@distilled.cloud/aws/cost-explorer";
import * as Layer from "effect/Layer";
import { makeCostExplorerHttpBinding } from "./BindingHttp.js";
import { GetCostForecast } from "./GetCostForecast.js";
export const GetCostForecastHttp = Layer.effect(GetCostForecast, makeCostExplorerHttpBinding({
    capability: "GetCostForecast",
    iamActions: ["ce:GetCostForecast"],
    operation: ce.getCostForecast,
}));
//# sourceMappingURL=GetCostForecastHttp.js.map