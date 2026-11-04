import * as eks from "@distilled.cloud/aws/eks";
import * as Layer from "effect/Layer";
import { makeEKSClusterHttpBinding } from "./BindingHttp.js";
import { ListAssociatedAccessPolicies } from "./ListAssociatedAccessPolicies.js";
export const ListAssociatedAccessPoliciesHttp = Layer.effect(ListAssociatedAccessPolicies, makeEKSClusterHttpBinding({
    tag: "AWS.EKS.ListAssociatedAccessPolicies",
    operation: eks.listAssociatedAccessPolicies,
    actions: ["eks:ListAssociatedAccessPolicies"],
    key: "clusterName",
    scope: "subresources",
}));
//# sourceMappingURL=ListAssociatedAccessPoliciesHttp.js.map