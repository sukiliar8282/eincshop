import * as sfn from "@distilled.cloud/aws/sfn";
import * as Layer from "effect/Layer";
import { makeStateMachineArnHttpBinding } from "./BindingHttp.js";
import { ListExecutions } from "./ListExecutions.js";
export const ListExecutionsHttp = Layer.effect(ListExecutions, makeStateMachineArnHttpBinding({
    tag: "AWS.StepFunctions.ListExecutions",
    operation: sfn.listExecutions,
    actions: ["states:ListExecutions"],
}));
//# sourceMappingURL=ListExecutionsHttp.js.map