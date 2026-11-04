import * as emrc from "@distilled.cloud/aws/emr-containers";
import * as Layer from "effect/Layer";
import { makeEMRContainersVirtualClusterHttpBinding } from "./BindingHttp.js";
import { ListJobRuns } from "./ListJobRuns.js";
export const ListJobRunsHttp = Layer.effect(ListJobRuns, makeEMRContainersVirtualClusterHttpBinding({
    tag: "AWS.EMRContainers.ListJobRuns",
    operation: emrc.listJobRuns,
    actions: ["emr-containers:ListJobRuns"],
}));
//# sourceMappingURL=ListJobRunsHttp.js.map