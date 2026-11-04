import * as emr from "@distilled.cloud/aws/emr";
import * as Layer from "effect/Layer";
import { makeEmrClusterHttpBinding } from "./BindingHttp.js";
import { ListInstanceGroups } from "./ListInstanceGroups.js";
export const ListInstanceGroupsHttp = Layer.effect(ListInstanceGroups, makeEmrClusterHttpBinding({
    tag: "AWS.EMR.ListInstanceGroups",
    operation: emr.listInstanceGroups,
    actions: ["elasticmapreduce:ListInstanceGroups"],
}));
//# sourceMappingURL=ListInstanceGroupsHttp.js.map