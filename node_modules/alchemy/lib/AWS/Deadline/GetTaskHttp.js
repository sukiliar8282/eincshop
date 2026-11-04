import * as deadline from "@distilled.cloud/aws/deadline";
import * as Layer from "effect/Layer";
import { makeDeadlineQueueHttpBinding } from "./BindingHttp.js";
import { GetTask } from "./GetTask.js";
export const GetTaskHttp = Layer.effect(GetTask, makeDeadlineQueueHttpBinding({
    tag: "AWS.Deadline.GetTask",
    operation: deadline.getTask,
    actions: ["deadline:GetTask"],
}));
//# sourceMappingURL=GetTaskHttp.js.map