import * as sfn from "@distilled.cloud/aws/sfn";
import * as Layer from "effect/Layer";
import { makeStateMachineArnHttpBinding } from "./BindingHttp.js";
import { StartExecution } from "./StartExecution.js";
export const StartExecutionHttp = Layer.effect(StartExecution, makeStateMachineArnHttpBinding({
    tag: "AWS.StepFunctions.StartExecution",
    operation: sfn.startExecution,
    actions: ["states:StartExecution"],
}));
//# sourceMappingURL=StartExecutionHttp.js.map