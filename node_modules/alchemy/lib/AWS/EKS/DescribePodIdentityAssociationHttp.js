import * as eks from "@distilled.cloud/aws/eks";
import * as Layer from "effect/Layer";
import { makeEKSClusterHttpBinding } from "./BindingHttp.js";
import { DescribePodIdentityAssociation } from "./DescribePodIdentityAssociation.js";
export const DescribePodIdentityAssociationHttp = Layer.effect(DescribePodIdentityAssociation, makeEKSClusterHttpBinding({
    tag: "AWS.EKS.DescribePodIdentityAssociation",
    operation: eks.describePodIdentityAssociation,
    actions: ["eks:DescribePodIdentityAssociation"],
    key: "clusterName",
    scope: "subresources",
}));
//# sourceMappingURL=DescribePodIdentityAssociationHttp.js.map