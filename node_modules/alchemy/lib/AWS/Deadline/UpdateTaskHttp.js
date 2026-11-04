import * as deadline from "@distilled.cloud/aws/deadline";
import * as Layer from "effect/Layer";
import { makeDeadlineQueueHttpBinding } from "./BindingHttp.js";
import { UpdateTask } from "./UpdateTask.js";
export const UpdateTaskHttp = Layer.effect(UpdateTask, makeDeadlineQueueHttpBinding({
    tag: "AWS.Deadline.UpdateTask",
    operation: deadline.updateTask,
    actions: ["deadline:UpdateTask"],
}));
//# sourceMappingURL=UpdateTaskHttp.js.map