import * as eks from "@distilled.cloud/aws/eks";
import * as Layer from "effect/Layer";
import { makeEKSClusterHttpBinding } from "./BindingHttp.js";
import { ListIdentityProviderConfigs } from "./ListIdentityProviderConfigs.js";
export const ListIdentityProviderConfigsHttp = Layer.effect(ListIdentityProviderConfigs, makeEKSClusterHttpBinding({
    tag: "AWS.EKS.ListIdentityProviderConfigs",
    operation: eks.listIdentityProviderConfigs,
    actions: ["eks:ListIdentityProviderConfigs"],
    key: "clusterName",
    scope: "cluster",
}));
//# sourceMappingURL=ListIdentityProviderConfigsHttp.js.map