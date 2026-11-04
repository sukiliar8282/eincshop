import * as imagebuilder from "@distilled.cloud/aws/imagebuilder";
import * as Layer from "effect/Layer";
import { makeImageBuilderAccountHttpBinding } from "./BindingHttp.js";
import { ListWorkflowExecutions } from "./ListWorkflowExecutions.js";
export const ListWorkflowExecutionsHttp = Layer.effect(ListWorkflowExecutions, makeImageBuilderAccountHttpBinding({
    tag: "AWS.ImageBuilder.ListWorkflowExecutions",
    operation: imagebuilder.listWorkflowExecutions,
    actions: ["imagebuilder:ListWorkflowExecutions"],
}));
//# sourceMappingURL=ListWorkflowExecutionsHttp.js.map