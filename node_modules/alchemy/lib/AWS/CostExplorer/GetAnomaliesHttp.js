import * as ce from "@distilled.cloud/aws/cost-explorer";
import * as Layer from "effect/Layer";
import { makeAnomalyMonitorHttpBinding } from "./BindingHttp.js";
import { GetAnomalies } from "./GetAnomalies.js";
export const GetAnomaliesHttp = Layer.effect(GetAnomalies, makeAnomalyMonitorHttpBinding({
    capability: "GetAnomalies",
    iamActions: ["ce:GetAnomalies"],
    operation: ce.getAnomalies,
}));
//# sourceMappingURL=GetAnomaliesHttp.js.map