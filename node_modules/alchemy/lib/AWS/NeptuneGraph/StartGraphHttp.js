import * as neptunegraph from "@distilled.cloud/aws/neptune-graph";
import * as Layer from "effect/Layer";
import { makeNeptuneGraphGraphHttpBinding } from "./BindingHttp.js";
import { StartGraph } from "./StartGraph.js";
export const StartGraphHttp = Layer.effect(StartGraph, makeNeptuneGraphGraphHttpBinding({
    tag: "AWS.NeptuneGraph.StartGraph",
    operation: neptunegraph.startGraph,
    actions: ["neptune-graph:StartGraph"],
}));
//# sourceMappingURL=StartGraphHttp.js.map