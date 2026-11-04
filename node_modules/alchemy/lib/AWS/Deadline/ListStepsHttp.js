import * as deadline from "@distilled.cloud/aws/deadline";
import * as Layer from "effect/Layer";
import { makeDeadlineQueueHttpBinding } from "./BindingHttp.js";
import { ListSteps } from "./ListSteps.js";
export const ListStepsHttp = Layer.effect(ListSteps, makeDeadlineQueueHttpBinding({
    tag: "AWS.Deadline.ListSteps",
    operation: deadline.listSteps,
    actions: ["deadline:ListSteps"],
}));
//# sourceMappingURL=ListStepsHttp.js.map