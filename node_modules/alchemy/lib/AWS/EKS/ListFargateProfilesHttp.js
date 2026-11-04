import * as eks from "@distilled.cloud/aws/eks";
import * as Layer from "effect/Layer";
import { makeEKSClusterHttpBinding } from "./BindingHttp.js";
import { ListFargateProfiles } from "./ListFargateProfiles.js";
export const ListFargateProfilesHttp = Layer.effect(ListFargateProfiles, makeEKSClusterHttpBinding({
    tag: "AWS.EKS.ListFargateProfiles",
    operation: eks.listFargateProfiles,
    actions: ["eks:ListFargateProfiles"],
    key: "clusterName",
    scope: "cluster",
}));
//# sourceMappingURL=ListFargateProfilesHttp.js.map