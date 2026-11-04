import * as finspace from "@distilled.cloud/aws/finspace";
import * as Layer from "effect/Layer";
import { makeFinSpaceKxHttpBinding } from "./BindingHttp.js";
import { ListKxClusters } from "./ListKxClusters.js";
export const ListKxClustersHttp = Layer.effect(ListKxClusters, makeFinSpaceKxHttpBinding({
    tag: "AWS.FinSpace.ListKxClusters",
    operation: finspace.listKxClusters,
    actions: ["finspace:ListKxClusters"],
}));
//# sourceMappingURL=ListKxClustersHttp.js.map