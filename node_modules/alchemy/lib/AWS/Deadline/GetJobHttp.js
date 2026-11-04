import * as deadline from "@distilled.cloud/aws/deadline";
import * as Layer from "effect/Layer";
import { makeDeadlineQueueHttpBinding } from "./BindingHttp.js";
import { GetJob } from "./GetJob.js";
export const GetJobHttp = Layer.effect(GetJob, makeDeadlineQueueHttpBinding({
    tag: "AWS.Deadline.GetJob",
    operation: deadline.getJob,
    actions: ["deadline:GetJob"],
}));
//# sourceMappingURL=GetJobHttp.js.map