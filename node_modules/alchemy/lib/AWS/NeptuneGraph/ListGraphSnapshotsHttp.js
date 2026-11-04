import * as neptunegraph from "@distilled.cloud/aws/neptune-graph";
import * as Layer from "effect/Layer";
import { makeNeptuneGraphGraphHttpBinding, SNAPSHOT_ARN_WILDCARD, } from "./BindingHttp.js";
import { ListGraphSnapshots } from "./ListGraphSnapshots.js";
export const ListGraphSnapshotsHttp = Layer.effect(ListGraphSnapshots, makeNeptuneGraphGraphHttpBinding({
    tag: "AWS.NeptuneGraph.ListGraphSnapshots",
    operation: neptunegraph.listGraphSnapshots,
    actions: ["neptune-graph:ListGraphSnapshots"],
    extraResources: [SNAPSHOT_ARN_WILDCARD],
}));
//# sourceMappingURL=ListGraphSnapshotsHttp.js.map