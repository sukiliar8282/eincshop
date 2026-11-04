import * as ce from "@distilled.cloud/aws/cost-explorer";
import * as Layer from "effect/Layer";
import { makeCostExplorerHttpBinding } from "./BindingHttp.js";
import { GetCostCategories } from "./GetCostCategories.js";
export const GetCostCategoriesHttp = Layer.effect(GetCostCategories, makeCostExplorerHttpBinding({
    capability: "GetCostCategories",
    iamActions: ["ce:GetCostCategories"],
    operation: ce.getCostCategories,
}));
//# sourceMappingURL=GetCostCategoriesHttp.js.map