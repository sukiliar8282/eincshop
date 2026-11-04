import * as batch from "@distilled.cloud/aws/batch";
import * as Layer from "effect/Layer";
import { makeBatchQueueHttpBinding } from "./BindingHttp.js";
import { ListJobs } from "./ListJobs.js";
export const ListJobsHttp = Layer.effect(ListJobs, 
// batch:ListJobs does not support resource-level IAM.
makeBatchQueueHttpBinding({
    tag: "AWS.Batch.ListJobs",
    operation: batch.listJobs,
    actions: ["batch:ListJobs"],
    wildcardIam: true,
}));
//# sourceMappingURL=ListJobsHttp.js.map