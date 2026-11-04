import * as datasync from "@distilled.cloud/aws/datasync";
import * as Layer from "effect/Layer";
import { makeDataSyncTaskHttpBinding } from "./BindingHttp.js";
import { DescribeTask } from "./DescribeTask.js";
export const DescribeTaskHttp = Layer.effect(DescribeTask, makeDataSyncTaskHttpBinding({
    tag: "AWS.DataSync.DescribeTask",
    operation: datasync.describeTask,
    actions: ["datasync:DescribeTask"],
}));
//# sourceMappingURL=DescribeTaskHttp.js.map