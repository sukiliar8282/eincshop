import * as omics from "@distilled.cloud/aws/omics";
import * as Layer from "effect/Layer";
import { makeOmicsAccountHttpBinding } from "./BindingHttp.js";
import { ListRunTasks } from "./ListRunTasks.js";
export const ListRunTasksHttp = Layer.effect(ListRunTasks, makeOmicsAccountHttpBinding({
    tag: "AWS.Omics.ListRunTasks",
    operation: omics.listRunTasks,
    actions: ["omics:ListRunTasks"],
}));
//# sourceMappingURL=ListRunTasksHttp.js.map