import * as ce from "@distilled.cloud/aws/cost-explorer";
import * as Layer from "effect/Layer";
import { makeCostExplorerHttpBinding } from "./BindingHttp.js";
import { UpdateCostAllocationTagsStatus } from "./UpdateCostAllocationTagsStatus.js";
export const UpdateCostAllocationTagsStatusHttp = Layer.effect(UpdateCostAllocationTagsStatus, makeCostExplorerHttpBinding({
    capability: "UpdateCostAllocationTagsStatus",
    iamActions: ["ce:UpdateCostAllocationTagsStatus"],
    operation: ce.updateCostAllocationTagsStatus,
}));
//# sourceMappingURL=UpdateCostAllocationTagsStatusHttp.js.map