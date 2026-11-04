import * as datazone from "@distilled.cloud/aws/datazone";
import * as Layer from "effect/Layer";
import { makeDataZoneDomainHttpBinding } from "./BindingHttp.js";
import { RejectPredictions } from "./RejectPredictions.js";
export const RejectPredictionsHttp = Layer.effect(RejectPredictions, makeDataZoneDomainHttpBinding({
    tag: "AWS.DataZone.RejectPredictions",
    operation: datazone.rejectPredictions,
    actions: ["datazone:RejectPredictions"],
}));
//# sourceMappingURL=RejectPredictionsHttp.js.map