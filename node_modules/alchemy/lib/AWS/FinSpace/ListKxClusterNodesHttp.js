import * as finspace from "@distilled.cloud/aws/finspace";
import * as Layer from "effect/Layer";
import { makeFinSpaceKxHttpBinding } from "./BindingHttp.js";
import { ListKxClusterNodes } from "./ListKxClusterNodes.js";
export const ListKxClusterNodesHttp = Layer.effect(ListKxClusterNodes, makeFinSpaceKxHttpBinding({
    tag: "AWS.FinSpace.ListKxClusterNodes",
    operation: finspace.listKxClusterNodes,
    actions: ["finspace:ListKxClusterNodes"],
}));
//# sourceMappingURL=ListKxClusterNodesHttp.js.map