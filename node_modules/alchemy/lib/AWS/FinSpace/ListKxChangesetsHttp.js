import * as finspace from "@distilled.cloud/aws/finspace";
import * as Layer from "effect/Layer";
import { makeFinSpaceKxHttpBinding } from "./BindingHttp.js";
import { ListKxChangesets } from "./ListKxChangesets.js";
export const ListKxChangesetsHttp = Layer.effect(ListKxChangesets, makeFinSpaceKxHttpBinding({
    tag: "AWS.FinSpace.ListKxChangesets",
    operation: finspace.listKxChangesets,
    actions: ["finspace:ListKxChangesets"],
}));
//# sourceMappingURL=ListKxChangesetsHttp.js.map