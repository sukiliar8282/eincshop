import * as neptunegraph from "@distilled.cloud/aws/neptune-graph";
import * as Layer from "effect/Layer";
import { makeNeptuneGraphGraphHttpBinding } from "./BindingHttp.js";
import { ResetGraph } from "./ResetGraph.js";
export const ResetGraphHttp = Layer.effect(ResetGraph, makeNeptuneGraphGraphHttpBinding({
    tag: "AWS.NeptuneGraph.ResetGraph",
    operation: neptunegraph.resetGraph,
    actions: ["neptune-graph:ResetGraph"],
}));
//# sourceMappingURL=ResetGraphHttp.js.map