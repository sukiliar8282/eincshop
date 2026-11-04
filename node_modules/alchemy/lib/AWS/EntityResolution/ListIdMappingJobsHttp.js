import * as entityresolution from "@distilled.cloud/aws/entityresolution";
import * as Layer from "effect/Layer";
import { makeWorkflowHttpBinding } from "./BindingHttp.js";
import { ListIdMappingJobs } from "./ListIdMappingJobs.js";
export const ListIdMappingJobsHttp = Layer.effect(ListIdMappingJobs, makeWorkflowHttpBinding({
    tag: "AWS.EntityResolution.ListIdMappingJobs",
    operation: entityresolution.listIdMappingJobs,
    actions: ["entityresolution:ListIdMappingJobs"],
}));
//# sourceMappingURL=ListIdMappingJobsHttp.js.map