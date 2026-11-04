import * as docdb from "@distilled.cloud/aws/docdb";
import * as Layer from "effect/Layer";
import { makeDocDBClusterHttpBinding } from "./BindingHttp.js";
import { FailoverDBCluster } from "./FailoverDBCluster.js";
export const FailoverDBClusterHttp = Layer.effect(FailoverDBCluster, makeDocDBClusterHttpBinding({
    tag: "AWS.DocDB.FailoverDBCluster",
    operation: docdb.failoverDBCluster,
    actions: ["rds:FailoverDBCluster"],
}));
//# sourceMappingURL=FailoverDBClusterHttp.js.map