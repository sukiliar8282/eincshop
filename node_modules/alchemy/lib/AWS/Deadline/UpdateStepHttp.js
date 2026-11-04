import * as deadline from "@distilled.cloud/aws/deadline";
import * as Layer from "effect/Layer";
import { makeDeadlineQueueHttpBinding } from "./BindingHttp.js";
import { UpdateStep } from "./UpdateStep.js";
export const UpdateStepHttp = Layer.effect(UpdateStep, makeDeadlineQueueHttpBinding({
    tag: "AWS.Deadline.UpdateStep",
    operation: deadline.updateStep,
    actions: ["deadline:UpdateStep"],
}));
//# sourceMappingURL=UpdateStepHttp.js.map