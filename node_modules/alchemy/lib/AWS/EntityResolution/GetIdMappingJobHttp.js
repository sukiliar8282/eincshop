import * as entityresolution from "@distilled.cloud/aws/entityresolution";
import * as Layer from "effect/Layer";
import { makeWorkflowHttpBinding } from "./BindingHttp.js";
import { GetIdMappingJob } from "./GetIdMappingJob.js";
export const GetIdMappingJobHttp = Layer.effect(GetIdMappingJob, makeWorkflowHttpBinding({
    tag: "AWS.EntityResolution.GetIdMappingJob",
    operation: entityresolution.getIdMappingJob,
    actions: ["entityresolution:GetIdMappingJob"],
}));
//# sourceMappingURL=GetIdMappingJobHttp.js.map