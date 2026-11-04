import * as emr from "@distilled.cloud/aws/emr";
import * as Layer from "effect/Layer";
import { makeEmrClusterHttpBinding } from "./BindingHttp.js";
import { ListInstances } from "./ListInstances.js";
export const ListInstancesHttp = Layer.effect(ListInstances, makeEmrClusterHttpBinding({
    tag: "AWS.EMR.ListInstances",
    operation: emr.listInstances,
    actions: ["elasticmapreduce:ListInstances"],
}));
//# sourceMappingURL=ListInstancesHttp.js.map