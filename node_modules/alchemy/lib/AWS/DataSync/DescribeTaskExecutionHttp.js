import * as datasync from "@distilled.cloud/aws/datasync";
import * as Layer from "effect/Layer";
import { makeDataSyncTaskExecutionHttpBinding } from "./BindingHttp.js";
import { DescribeTaskExecution } from "./DescribeTaskExecution.js";
export const DescribeTaskExecutionHttp = Layer.effect(DescribeTaskExecution, makeDataSyncTaskExecutionHttpBinding({
    tag: "AWS.DataSync.DescribeTaskExecution",
    operation: datasync.describeTaskExecution,
    actions: ["datasync:DescribeTaskExecution"],
}));
//# sourceMappingURL=DescribeTaskExecutionHttp.js.map