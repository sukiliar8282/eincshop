import * as s3control from "@distilled.cloud/aws/s3-control";
import * as Layer from "effect/Layer";
import { makeS3ControlAccountHttpBinding } from "./BindingHttp.js";
import { UpdateJobPriority } from "./UpdateJobPriority.js";
export const UpdateJobPriorityHttp = Layer.effect(UpdateJobPriority, makeS3ControlAccountHttpBinding({
    tag: "AWS.S3Control.UpdateJobPriority",
    operation: s3control.updateJobPriority,
    actions: ["s3:UpdateJobPriority"],
}));
//# sourceMappingURL=UpdateJobPriorityHttp.js.map