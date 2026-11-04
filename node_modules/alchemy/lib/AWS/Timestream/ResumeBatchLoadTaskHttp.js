import * as TSW from "@distilled.cloud/aws/timestream-write";
import * as Layer from "effect/Layer";
import { makeWriteAccountHttpBinding } from "./BindingHttp.js";
import { ResumeBatchLoadTask } from "./ResumeBatchLoadTask.js";
export const ResumeBatchLoadTaskHttp = Layer.effect(ResumeBatchLoadTask, makeWriteAccountHttpBinding({
    tag: "AWS.Timestream.ResumeBatchLoadTask",
    operation: TSW.resumeBatchLoadTask,
    actions: ["timestream:ResumeBatchLoadTask"],
}));
//# sourceMappingURL=ResumeBatchLoadTaskHttp.js.map