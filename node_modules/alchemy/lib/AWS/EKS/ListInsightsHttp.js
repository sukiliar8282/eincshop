import * as eks from "@distilled.cloud/aws/eks";
import * as Layer from "effect/Layer";
import { makeEKSClusterHttpBinding } from "./BindingHttp.js";
import { ListInsights } from "./ListInsights.js";
export const ListInsightsHttp = Layer.effect(ListInsights, makeEKSClusterHttpBinding({
    tag: "AWS.EKS.ListInsights",
    operation: eks.listInsights,
    actions: ["eks:ListInsights"],
    key: "clusterName",
    scope: "cluster",
}));
//# sourceMappingURL=ListInsightsHttp.js.map