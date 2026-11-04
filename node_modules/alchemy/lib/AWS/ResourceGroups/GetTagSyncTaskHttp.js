import * as resourcegroups from "@distilled.cloud/aws/resource-groups";
import * as Layer from "effect/Layer";
import { makeResourceGroupsAccountHttpBinding } from "./BindingHttp.js";
import { GetTagSyncTask } from "./GetTagSyncTask.js";
export const GetTagSyncTaskHttp = Layer.effect(GetTagSyncTask, makeResourceGroupsAccountHttpBinding({
    tag: "AWS.ResourceGroups.GetTagSyncTask",
    operation: resourcegroups.getTagSyncTask,
    actions: ["resource-groups:GetTagSyncTask"],
}));
//# sourceMappingURL=GetTagSyncTaskHttp.js.map