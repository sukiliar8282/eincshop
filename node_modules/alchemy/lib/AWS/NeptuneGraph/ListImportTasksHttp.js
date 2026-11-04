import * as neptunegraph from "@distilled.cloud/aws/neptune-graph";
import * as Layer from "effect/Layer";
import { IMPORT_TASK_ARN_WILDCARD, makeNeptuneGraphAccountHttpBinding, } from "./BindingHttp.js";
import { ListImportTasks } from "./ListImportTasks.js";
export const ListImportTasksHttp = Layer.effect(ListImportTasks, makeNeptuneGraphAccountHttpBinding({
    tag: "AWS.NeptuneGraph.ListImportTasks",
    operation: neptunegraph.listImportTasks,
    actions: ["neptune-graph:ListImportTasks"],
    resources: [IMPORT_TASK_ARN_WILDCARD],
}));
//# sourceMappingURL=ListImportTasksHttp.js.map