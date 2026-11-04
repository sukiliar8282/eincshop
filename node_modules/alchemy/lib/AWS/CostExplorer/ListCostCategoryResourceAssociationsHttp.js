import * as ce from "@distilled.cloud/aws/cost-explorer";
import * as Layer from "effect/Layer";
import { makeCostCategoryHttpBinding } from "./BindingHttp.js";
import { ListCostCategoryResourceAssociations } from "./ListCostCategoryResourceAssociations.js";
export const ListCostCategoryResourceAssociationsHttp = Layer.effect(ListCostCategoryResourceAssociations, makeCostCategoryHttpBinding({
    capability: "ListCostCategoryResourceAssociations",
    iamActions: ["ce:ListCostCategoryResourceAssociations"],
    operation: ce.listCostCategoryResourceAssociations,
}));
//# sourceMappingURL=ListCostCategoryResourceAssociationsHttp.js.map