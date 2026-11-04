import * as ce from "@distilled.cloud/aws/cost-explorer";
import * as Layer from "effect/Layer";
import { makeCostExplorerHttpBinding } from "./BindingHttp.js";
import { GetSavingsPlansUtilization } from "./GetSavingsPlansUtilization.js";
export const GetSavingsPlansUtilizationHttp = Layer.effect(GetSavingsPlansUtilization, makeCostExplorerHttpBinding({
    capability: "GetSavingsPlansUtilization",
    iamActions: ["ce:GetSavingsPlansUtilization"],
    operation: ce.getSavingsPlansUtilization,
}));
//# sourceMappingURL=GetSavingsPlansUtilizationHttp.js.map