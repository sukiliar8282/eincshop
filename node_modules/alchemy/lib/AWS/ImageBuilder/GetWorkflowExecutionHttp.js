import * as imagebuilder from "@distilled.cloud/aws/imagebuilder";
import * as Layer from "effect/Layer";
import { makeImageBuilderAccountHttpBinding } from "./BindingHttp.js";
import { GetWorkflowExecution } from "./GetWorkflowExecution.js";
export const GetWorkflowExecutionHttp = Layer.effect(GetWorkflowExecution, makeImageBuilderAccountHttpBinding({
    tag: "AWS.ImageBuilder.GetWorkflowExecution",
    operation: imagebuilder.getWorkflowExecution,
    actions: ["imagebuilder:GetWorkflowExecution"],
}));
//# sourceMappingURL=GetWorkflowExecutionHttp.js.map