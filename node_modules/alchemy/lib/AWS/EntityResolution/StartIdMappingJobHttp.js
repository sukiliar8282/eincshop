import * as entityresolution from "@distilled.cloud/aws/entityresolution";
import * as Layer from "effect/Layer";
import { makeWorkflowHttpBinding } from "./BindingHttp.js";
import { StartIdMappingJob } from "./StartIdMappingJob.js";
export const StartIdMappingJobHttp = Layer.effect(StartIdMappingJob, makeWorkflowHttpBinding({
    tag: "AWS.EntityResolution.StartIdMappingJob",
    operation: entityresolution.startIdMappingJob,
    actions: ["entityresolution:StartIdMappingJob"],
}));
//# sourceMappingURL=StartIdMappingJobHttp.js.map