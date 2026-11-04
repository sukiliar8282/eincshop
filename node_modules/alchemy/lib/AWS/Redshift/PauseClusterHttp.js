import * as redshift from "@distilled.cloud/aws/redshift";
import * as Layer from "effect/Layer";
import { makeRedshiftClusterHttpBinding } from "./BindingHttp.js";
import { PauseCluster } from "./PauseCluster.js";
export const PauseClusterHttp = Layer.effect(PauseCluster, makeRedshiftClusterHttpBinding({
    tag: "AWS.Redshift.PauseCluster",
    operation: redshift.pauseCluster,
    actions: ["redshift:PauseCluster"],
}));
//# sourceMappingURL=PauseClusterHttp.js.map