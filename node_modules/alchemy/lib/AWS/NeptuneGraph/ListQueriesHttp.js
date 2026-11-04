import * as neptunegraph from "@distilled.cloud/aws/neptune-graph";
import * as Layer from "effect/Layer";
import { makeNeptuneGraphGraphHttpBinding } from "./BindingHttp.js";
import { ListQueries } from "./ListQueries.js";
export const ListQueriesHttp = Layer.effect(ListQueries, makeNeptuneGraphGraphHttpBinding({
    tag: "AWS.NeptuneGraph.ListQueries",
    operation: neptunegraph.listQueries,
    actions: ["neptune-graph:ListQueries"],
}));
//# sourceMappingURL=ListQueriesHttp.js.map