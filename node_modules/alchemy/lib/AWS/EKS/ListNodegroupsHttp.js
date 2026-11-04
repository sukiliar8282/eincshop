import * as eks from "@distilled.cloud/aws/eks";
import * as Layer from "effect/Layer";
import { makeEKSClusterHttpBinding } from "./BindingHttp.js";
import { ListNodegroups } from "./ListNodegroups.js";
export const ListNodegroupsHttp = Layer.effect(ListNodegroups, makeEKSClusterHttpBinding({
    tag: "AWS.EKS.ListNodegroups",
    operation: eks.listNodegroups,
    actions: ["eks:ListNodegroups"],
    key: "clusterName",
    scope: "cluster",
}));
//# sourceMappingURL=ListNodegroupsHttp.js.map