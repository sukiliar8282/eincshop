import * as entityresolution from "@distilled.cloud/aws/entityresolution";
import * as Layer from "effect/Layer";
import { makeWorkflowHttpBinding } from "./BindingHttp.js";
import { ListMatchingJobs } from "./ListMatchingJobs.js";
export const ListMatchingJobsHttp = Layer.effect(ListMatchingJobs, makeWorkflowHttpBinding({
    tag: "AWS.EntityResolution.ListMatchingJobs",
    operation: entityresolution.listMatchingJobs,
    actions: ["entityresolution:ListMatchingJobs"],
}));
//# sourceMappingURL=ListMatchingJobsHttp.js.map