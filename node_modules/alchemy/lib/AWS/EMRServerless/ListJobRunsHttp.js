import * as emr from "@distilled.cloud/aws/emr-serverless";
import * as Layer from "effect/Layer";
import { makeEmrServerlessHttpBinding } from "./BindingHttp.js";
import { ListJobRuns } from "./ListJobRuns.js";
export const ListJobRunsHttp = Layer.effect(ListJobRuns, makeEmrServerlessHttpBinding({
    tag: "AWS.EMRServerless.ListJobRuns",
    operation: emr.listJobRuns,
    actions: ["emr-serverless:ListJobRuns"],
}));
//# sourceMappingURL=ListJobRunsHttp.js.map