import * as resourcegroups from "@distilled.cloud/aws/resource-groups";
import * as Layer from "effect/Layer";
import { makeResourceGroupsGroupHttpBinding } from "./BindingHttp.js";
import { ListGroupingStatuses } from "./ListGroupingStatuses.js";
export const ListGroupingStatusesHttp = Layer.effect(ListGroupingStatuses, makeResourceGroupsGroupHttpBinding({
    tag: "AWS.ResourceGroups.ListGroupingStatuses",
    operation: resourcegroups.listGroupingStatuses,
    actions: ["resource-groups:ListGroupingStatuses"],
}));
//# sourceMappingURL=ListGroupingStatusesHttp.js.map