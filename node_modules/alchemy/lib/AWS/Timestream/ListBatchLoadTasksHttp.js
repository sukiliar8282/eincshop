import * as TSW from "@distilled.cloud/aws/timestream-write";
import * as Layer from "effect/Layer";
import { makeWriteAccountHttpBinding } from "./BindingHttp.js";
import { ListBatchLoadTasks } from "./ListBatchLoadTasks.js";
export const ListBatchLoadTasksHttp = Layer.effect(ListBatchLoadTasks, makeWriteAccountHttpBinding({
    tag: "AWS.Timestream.ListBatchLoadTasks",
    operation: TSW.listBatchLoadTasks,
    actions: ["timestream:ListBatchLoadTasks"],
}));
//# sourceMappingURL=ListBatchLoadTasksHttp.js.map