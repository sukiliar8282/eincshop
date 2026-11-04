import * as ce from "@distilled.cloud/aws/cost-explorer";
import * as Layer from "effect/Layer";
import { makeCostExplorerHttpBinding } from "./BindingHttp.js";
import { GetReservationUtilization } from "./GetReservationUtilization.js";
export const GetReservationUtilizationHttp = Layer.effect(GetReservationUtilization, makeCostExplorerHttpBinding({
    capability: "GetReservationUtilization",
    iamActions: ["ce:GetReservationUtilization"],
    operation: ce.getReservationUtilization,
}));
//# sourceMappingURL=GetReservationUtilizationHttp.js.map