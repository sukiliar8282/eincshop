import * as config from "@distilled.cloud/aws/config-service";
import * as Layer from "effect/Layer";
import { makeConfigAccountHttpBinding } from "./BindingHttp.js";
import { PutEvaluations } from "./PutEvaluations.js";
export const PutEvaluationsHttp = Layer.effect(PutEvaluations, makeConfigAccountHttpBinding({
    tag: "AWS.Config.PutEvaluations",
    operation: config.putEvaluations,
    actions: ["config:PutEvaluations"],
}));
//# sourceMappingURL=PutEvaluationsHttp.js.map