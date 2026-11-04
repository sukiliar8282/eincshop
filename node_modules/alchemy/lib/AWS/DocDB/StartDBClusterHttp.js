import * as docdb from "@distilled.cloud/aws/docdb";
import * as Layer from "effect/Layer";
import { makeDocDBClusterHttpBinding } from "./BindingHttp.js";
import { StartDBCluster } from "./StartDBCluster.js";
export const StartDBClusterHttp = Layer.effect(StartDBCluster, makeDocDBClusterHttpBinding({
    tag: "AWS.DocDB.StartDBCluster",
    operation: docdb.startDBCluster,
    actions: ["rds:StartDBCluster"],
}));
//# sourceMappingURL=StartDBClusterHttp.js.map