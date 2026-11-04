import * as eks from "@distilled.cloud/aws/eks";
import * as Layer from "effect/Layer";
import { makeEKSClusterHttpBinding } from "./BindingHttp.js";
import { StartInsightsRefresh } from "./StartInsightsRefresh.js";
export const StartInsightsRefreshHttp = Layer.effect(StartInsightsRefresh, makeEKSClusterHttpBinding({
    tag: "AWS.EKS.StartInsightsRefresh",
    operation: eks.startInsightsRefresh,
    actions: ["eks:StartInsightsRefresh"],
    key: "clusterName",
    scope: "cluster",
}));
//# sourceMappingURL=StartInsightsRefreshHttp.js.map