import * as appsignals from "@distilled.cloud/aws/application-signals";
import * as Layer from "effect/Layer";
import { makeSloIdHttpBinding } from "./BindingHttp.js";
import { GetServiceLevelObjective } from "./GetServiceLevelObjective.js";
export const GetServiceLevelObjectiveHttp = Layer.effect(GetServiceLevelObjective, makeSloIdHttpBinding({
    tag: "AWS.ApplicationSignals.GetServiceLevelObjective",
    operation: appsignals.getServiceLevelObjective,
    actions: ["application-signals:GetServiceLevelObjective"],
}));
//# sourceMappingURL=GetServiceLevelObjectiveHttp.js.map