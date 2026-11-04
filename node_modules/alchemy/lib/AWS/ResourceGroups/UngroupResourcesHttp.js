import * as resourcegroups from "@distilled.cloud/aws/resource-groups";
import * as Layer from "effect/Layer";
import { makeResourceGroupsGroupHttpBinding } from "./BindingHttp.js";
import { UngroupResources } from "./UngroupResources.js";
export const UngroupResourcesHttp = Layer.effect(UngroupResources, makeResourceGroupsGroupHttpBinding({
    tag: "AWS.ResourceGroups.UngroupResources",
    operation: resourcegroups.ungroupResources,
    actions: ["resource-groups:UngroupResources"],
    // Application-group membership is removed by untagging the member
    // through the Resource Groups Tagging API.
    supportingActions: ["tag:GetResources", "tag:UntagResources"],
}));
//# sourceMappingURL=UngroupResourcesHttp.js.map