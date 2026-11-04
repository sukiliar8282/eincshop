import * as imagebuilder from "@distilled.cloud/aws/imagebuilder";
import * as Layer from "effect/Layer";
import { makeImageBuilderAccountHttpBinding } from "./BindingHttp.js";
import { ListWaitingWorkflowSteps } from "./ListWaitingWorkflowSteps.js";
export const ListWaitingWorkflowStepsHttp = Layer.effect(ListWaitingWorkflowSteps, makeImageBuilderAccountHttpBinding({
    tag: "AWS.ImageBuilder.ListWaitingWorkflowSteps",
    operation: imagebuilder.listWaitingWorkflowSteps,
    actions: ["imagebuilder:ListWaitingWorkflowSteps"],
}));
//# sourceMappingURL=ListWaitingWorkflowStepsHttp.js.map