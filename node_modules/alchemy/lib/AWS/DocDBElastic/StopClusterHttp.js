import * as docdbelastic from "@distilled.cloud/aws/docdb-elastic";
import * as Layer from "effect/Layer";
import { makeDocDBElasticClusterHttpBinding } from "./BindingHttp.js";
import { StopCluster } from "./StopCluster.js";
export const StopClusterHttp = Layer.effect(StopCluster, makeDocDBElasticClusterHttpBinding({
    tag: "AWS.DocDBElastic.StopCluster",
    operation: docdbelastic.stopCluster,
    actions: ["docdb-elastic:StopCluster"],
}));
//# sourceMappingURL=StopClusterHttp.js.map