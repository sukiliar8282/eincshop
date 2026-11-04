import * as eks from "@distilled.cloud/aws/eks";
import * as Layer from "effect/Layer";
import { makeEKSClusterHttpBinding } from "./BindingHttp.js";
import { ListPodIdentityAssociations } from "./ListPodIdentityAssociations.js";
export const ListPodIdentityAssociationsHttp = Layer.effect(ListPodIdentityAssociations, makeEKSClusterHttpBinding({
    tag: "AWS.EKS.ListPodIdentityAssociations",
    operation: eks.listPodIdentityAssociations,
    actions: ["eks:ListPodIdentityAssociations"],
    key: "clusterName",
    scope: "cluster",
}));
//# sourceMappingURL=ListPodIdentityAssociationsHttp.js.map