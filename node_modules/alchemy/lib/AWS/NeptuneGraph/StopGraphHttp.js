import * as neptunegraph from "@distilled.cloud/aws/neptune-graph";
import * as Layer from "effect/Layer";
import { makeNeptuneGraphGraphHttpBinding } from "./BindingHttp.js";
import { StopGraph } from "./StopGraph.js";
export const StopGraphHttp = Layer.effect(StopGraph, makeNeptuneGraphGraphHttpBinding({
    tag: "AWS.NeptuneGraph.StopGraph",
    operation: neptunegraph.stopGraph,
    actions: ["neptune-graph:StopGraph"],
}));
//# sourceMappingURL=StopGraphHttp.js.map