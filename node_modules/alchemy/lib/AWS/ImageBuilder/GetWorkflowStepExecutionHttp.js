import * as imagebuilder from "@distilled.cloud/aws/imagebuilder";
import * as Layer from "effect/Layer";
import { makeImageBuilderAccountHttpBinding } from "./BindingHttp.js";
import { GetWorkflowStepExecution } from "./GetWorkflowStepExecution.js";
export const GetWorkflowStepExecutionHttp = Layer.effect(GetWorkflowStepExecution, makeImageBuilderAccountHttpBinding({
    tag: "AWS.ImageBuilder.GetWorkflowStepExecution",
    operation: imagebuilder.getWorkflowStepExecution,
    actions: ["imagebuilder:GetWorkflowStepExecution"],
}));
//# sourceMappingURL=GetWorkflowStepExecutionHttp.js.map