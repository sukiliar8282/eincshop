import * as datasync from "@distilled.cloud/aws/datasync";
import * as Layer from "effect/Layer";
import { makeDataSyncTaskExecutionHttpBinding } from "./BindingHttp.js";
import { UpdateTaskExecution } from "./UpdateTaskExecution.js";
export const UpdateTaskExecutionHttp = Layer.effect(UpdateTaskExecution, makeDataSyncTaskExecutionHttpBinding({
    tag: "AWS.DataSync.UpdateTaskExecution",
    operation: datasync.updateTaskExecution,
    actions: ["datasync:UpdateTaskExecution"],
}));
//# sourceMappingURL=UpdateTaskExecutionHttp.js.map