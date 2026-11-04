import * as imagebuilder from "@distilled.cloud/aws/imagebuilder";
import * as Layer from "effect/Layer";
import { makeImageBuilderAccountHttpBinding } from "./BindingHttp.js";
import { ListWorkflowStepExecutions } from "./ListWorkflowStepExecutions.js";
export const ListWorkflowStepExecutionsHttp = Layer.effect(ListWorkflowStepExecutions, makeImageBuilderAccountHttpBinding({
    tag: "AWS.ImageBuilder.ListWorkflowStepExecutions",
    operation: imagebuilder.listWorkflowStepExecutions,
    actions: ["imagebuilder:ListWorkflowStepExecutions"],
}));
//# sourceMappingURL=ListWorkflowStepExecutionsHttp.js.map