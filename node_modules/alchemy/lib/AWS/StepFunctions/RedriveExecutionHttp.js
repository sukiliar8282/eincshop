import * as sfn from "@distilled.cloud/aws/sfn";
import * as Layer from "effect/Layer";
import { makeExecutionScopedHttpBinding } from "./BindingHttp.js";
import { RedriveExecution } from "./RedriveExecution.js";
export const RedriveExecutionHttp = Layer.effect(RedriveExecution, makeExecutionScopedHttpBinding({
    tag: "AWS.StepFunctions.RedriveExecution",
    operation: sfn.redriveExecution,
    actions: ["states:RedriveExecution"],
}));
//# sourceMappingURL=RedriveExecutionHttp.js.map