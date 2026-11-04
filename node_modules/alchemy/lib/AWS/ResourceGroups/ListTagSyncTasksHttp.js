import * as resourcegroups from "@distilled.cloud/aws/resource-groups";
import * as Layer from "effect/Layer";
import { makeResourceGroupsAccountHttpBinding } from "./BindingHttp.js";
import { ListTagSyncTasks } from "./ListTagSyncTasks.js";
export const ListTagSyncTasksHttp = Layer.effect(ListTagSyncTasks, makeResourceGroupsAccountHttpBinding({
    tag: "AWS.ResourceGroups.ListTagSyncTasks",
    operation: resourcegroups.listTagSyncTasks,
    actions: ["resource-groups:ListTagSyncTasks"],
}));
//# sourceMappingURL=ListTagSyncTasksHttp.js.map