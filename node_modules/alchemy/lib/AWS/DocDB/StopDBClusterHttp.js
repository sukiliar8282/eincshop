import * as docdb from "@distilled.cloud/aws/docdb";
import * as Layer from "effect/Layer";
import { makeDocDBClusterHttpBinding } from "./BindingHttp.js";
import { StopDBCluster } from "./StopDBCluster.js";
export const StopDBClusterHttp = Layer.effect(StopDBCluster, makeDocDBClusterHttpBinding({
    tag: "AWS.DocDB.StopDBCluster",
    operation: docdb.stopDBCluster,
    actions: ["rds:StopDBCluster"],
}));
//# sourceMappingURL=StopDBClusterHttp.js.map