import * as emrc from "@distilled.cloud/aws/emr-containers";
import * as Layer from "effect/Layer";
import { makeEMRContainersAccountHttpBinding } from "./BindingHttp.js";
import { ListVirtualClusters } from "./ListVirtualClusters.js";
export const ListVirtualClustersHttp = Layer.effect(ListVirtualClusters, makeEMRContainersAccountHttpBinding({
    tag: "AWS.EMRContainers.ListVirtualClusters",
    operation: emrc.listVirtualClusters,
    actions: ["emr-containers:ListVirtualClusters"],
}));
//# sourceMappingURL=ListVirtualClustersHttp.js.map