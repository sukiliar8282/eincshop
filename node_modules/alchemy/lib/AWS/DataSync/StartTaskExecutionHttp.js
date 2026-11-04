import * as datasync from "@distilled.cloud/aws/datasync";
import * as Layer from "effect/Layer";
import { makeDataSyncTaskHttpBinding } from "./BindingHttp.js";
import { StartTaskExecution } from "./StartTaskExecution.js";
export const StartTaskExecutionHttp = Layer.effect(StartTaskExecution, makeDataSyncTaskHttpBinding({
    tag: "AWS.DataSync.StartTaskExecution",
    operation: datasync.startTaskExecution,
    actions: ["datasync:StartTaskExecution"],
}));
//# sourceMappingURL=StartTaskExecutionHttp.js.map