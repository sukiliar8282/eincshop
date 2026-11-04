import * as sfn from "@distilled.cloud/aws/sfn";
import * as Layer from "effect/Layer";
import { makeExecutionScopedHttpBinding } from "./BindingHttp.js";
import { StopExecution } from "./StopExecution.js";
export const StopExecutionHttp = Layer.effect(StopExecution, makeExecutionScopedHttpBinding({
    tag: "AWS.StepFunctions.StopExecution",
    operation: sfn.stopExecution,
    actions: ["states:StopExecution"],
}));
//# sourceMappingURL=StopExecutionHttp.js.map