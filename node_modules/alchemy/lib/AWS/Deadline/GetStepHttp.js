import * as deadline from "@distilled.cloud/aws/deadline";
import * as Layer from "effect/Layer";
import { makeDeadlineQueueHttpBinding } from "./BindingHttp.js";
import { GetStep } from "./GetStep.js";
export const GetStepHttp = Layer.effect(GetStep, makeDeadlineQueueHttpBinding({
    tag: "AWS.Deadline.GetStep",
    operation: deadline.getStep,
    actions: ["deadline:GetStep"],
}));
//# sourceMappingURL=GetStepHttp.js.map