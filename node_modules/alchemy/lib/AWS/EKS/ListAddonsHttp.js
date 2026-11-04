import * as eks from "@distilled.cloud/aws/eks";
import * as Layer from "effect/Layer";
import { makeEKSClusterHttpBinding } from "./BindingHttp.js";
import { ListAddons } from "./ListAddons.js";
export const ListAddonsHttp = Layer.effect(ListAddons, makeEKSClusterHttpBinding({
    tag: "AWS.EKS.ListAddons",
    operation: eks.listAddons,
    actions: ["eks:ListAddons"],
    key: "clusterName",
    scope: "cluster",
}));
//# sourceMappingURL=ListAddonsHttp.js.map