import * as ce from "@distilled.cloud/aws/cost-explorer";
import * as Layer from "effect/Layer";
import { makeCostExplorerHttpBinding } from "./BindingHttp.js";
import { ListCostAllocationTags } from "./ListCostAllocationTags.js";
export const ListCostAllocationTagsHttp = Layer.effect(ListCostAllocationTags, makeCostExplorerHttpBinding({
    capability: "ListCostAllocationTags",
    iamActions: ["ce:ListCostAllocationTags"],
    operation: ce.listCostAllocationTags,
}));
//# sourceMappingURL=ListCostAllocationTagsHttp.js.map