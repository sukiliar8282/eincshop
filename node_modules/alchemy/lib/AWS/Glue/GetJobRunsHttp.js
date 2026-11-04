import * as glue from "@distilled.cloud/aws/glue";
import * as Layer from "effect/Layer";
import { makeGlueJobHttpBinding } from "./BindingHttp.js";
import { GetJobRuns } from "./GetJobRuns.js";
export const GetJobRunsHttp = Layer.effect(GetJobRuns, makeGlueJobHttpBinding({
    tag: "AWS.Glue.GetJobRuns",
    operation: glue.getJobRuns,
    actions: ["glue:GetJobRuns"],
}));
//# sourceMappingURL=GetJobRunsHttp.js.map