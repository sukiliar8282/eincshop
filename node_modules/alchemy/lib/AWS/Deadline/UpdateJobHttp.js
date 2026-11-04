import * as deadline from "@distilled.cloud/aws/deadline";
import * as Layer from "effect/Layer";
import { makeDeadlineQueueHttpBinding } from "./BindingHttp.js";
import { UpdateJob } from "./UpdateJob.js";
export const UpdateJobHttp = Layer.effect(UpdateJob, makeDeadlineQueueHttpBinding({
    tag: "AWS.Deadline.UpdateJob",
    operation: deadline.updateJob,
    actions: ["deadline:UpdateJob"],
}));
//# sourceMappingURL=UpdateJobHttp.js.map