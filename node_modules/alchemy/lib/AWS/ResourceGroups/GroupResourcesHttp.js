import * as resourcegroups from "@distilled.cloud/aws/resource-groups";
import * as Layer from "effect/Layer";
import { makeResourceGroupsGroupHttpBinding } from "./BindingHttp.js";
import { GroupResources } from "./GroupResources.js";
export const GroupResourcesHttp = Layer.effect(GroupResources, makeResourceGroupsGroupHttpBinding({
    tag: "AWS.ResourceGroups.GroupResources",
    operation: resourcegroups.groupResources,
    actions: ["resource-groups:GroupResources"],
    // Application-group membership works by applying the `awsApplication`
    // tag to the member through the Resource Groups Tagging API.
    supportingActions: ["tag:GetResources", "tag:TagResources"],
}));
//# sourceMappingURL=GroupResourcesHttp.js.map