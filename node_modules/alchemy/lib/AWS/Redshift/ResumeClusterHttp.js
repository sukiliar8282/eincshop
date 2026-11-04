import * as redshift from "@distilled.cloud/aws/redshift";
import * as Layer from "effect/Layer";
import { makeRedshiftClusterHttpBinding } from "./BindingHttp.js";
import { ResumeCluster } from "./ResumeCluster.js";
export const ResumeClusterHttp = Layer.effect(ResumeCluster, makeRedshiftClusterHttpBinding({
    tag: "AWS.Redshift.ResumeCluster",
    operation: redshift.resumeCluster,
    actions: ["redshift:ResumeCluster"],
}));
//# sourceMappingURL=ResumeClusterHttp.js.map