import * as eks from "@distilled.cloud/aws/eks";
import * as Layer from "effect/Layer";
import { makeEKSAccountHttpBinding } from "./BindingHttp.js";
import { ListClusters } from "./ListClusters.js";
export const ListClustersHttp = Layer.effect(ListClusters, makeEKSAccountHttpBinding({
    tag: "AWS.EKS.ListClusters",
    operation: eks.listClusters,
    actions: ["eks:ListClusters"],
}));
//# sourceMappingURL=ListClustersHttp.js.map