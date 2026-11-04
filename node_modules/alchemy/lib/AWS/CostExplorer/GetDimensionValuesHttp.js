import * as ce from "@distilled.cloud/aws/cost-explorer";
import * as Layer from "effect/Layer";
import { makeCostExplorerHttpBinding } from "./BindingHttp.js";
import { GetDimensionValues } from "./GetDimensionValues.js";
export const GetDimensionValuesHttp = Layer.effect(GetDimensionValues, makeCostExplorerHttpBinding({
    capability: "GetDimensionValues",
    iamActions: ["ce:GetDimensionValues"],
    operation: ce.getDimensionValues,
}));
//# sourceMappingURL=GetDimensionValuesHttp.js.map