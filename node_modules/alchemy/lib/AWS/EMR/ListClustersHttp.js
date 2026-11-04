import * as emr from "@distilled.cloud/aws/emr";
import * as Layer from "effect/Layer";
import { makeEmrAccountHttpBinding } from "./BindingHttp.js";
import { ListClusters } from "./ListClusters.js";
export const ListClustersHttp = Layer.effect(ListClusters, makeEmrAccountHttpBinding({
    tag: "AWS.EMR.ListClusters",
    operation: emr.listClusters,
    actions: ["elasticmapreduce:ListClusters"],
}));
//# sourceMappingURL=ListClustersHttp.js.map