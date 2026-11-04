import * as neptune from "@distilled.cloud/aws/neptune";
import * as Layer from "effect/Layer";
import { makeNeptuneClusterHttpBinding } from "./BindingHttp.js";
import { StopDBCluster } from "./StopDBCluster.js";
export const StopDBClusterHttp = Layer.effect(StopDBCluster, makeNeptuneClusterHttpBinding({
    tag: "AWS.Neptune.StopDBCluster",
    operation: neptune.stopDBCluster,
    actions: ["rds:StopDBCluster"],
}));
//# sourceMappingURL=StopDBClusterHttp.js.map