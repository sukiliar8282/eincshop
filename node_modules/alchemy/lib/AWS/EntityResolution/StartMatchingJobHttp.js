import * as entityresolution from "@distilled.cloud/aws/entityresolution";
import * as Layer from "effect/Layer";
import { makeWorkflowHttpBinding } from "./BindingHttp.js";
import { StartMatchingJob } from "./StartMatchingJob.js";
export const StartMatchingJobHttp = Layer.effect(StartMatchingJob, makeWorkflowHttpBinding({
    tag: "AWS.EntityResolution.StartMatchingJob",
    operation: entityresolution.startMatchingJob,
    actions: ["entityresolution:StartMatchingJob"],
}));
//# sourceMappingURL=StartMatchingJobHttp.js.map