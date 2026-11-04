import * as ce from "@distilled.cloud/aws/cost-explorer";
import * as Layer from "effect/Layer";
import { makeCostExplorerHttpBinding } from "./BindingHttp.js";
import { GetSavingsPlansUtilizationDetails } from "./GetSavingsPlansUtilizationDetails.js";
export const GetSavingsPlansUtilizationDetailsHttp = Layer.effect(GetSavingsPlansUtilizationDetails, makeCostExplorerHttpBinding({
    capability: "GetSavingsPlansUtilizationDetails",
    iamActions: ["ce:GetSavingsPlansUtilizationDetails"],
    operation: ce.getSavingsPlansUtilizationDetails,
}));
//# sourceMappingURL=GetSavingsPlansUtilizationDetailsHttp.js.map