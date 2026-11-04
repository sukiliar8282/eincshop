import * as s3control from "@distilled.cloud/aws/s3-control";
import * as Layer from "effect/Layer";
import { makeS3ControlAccountHttpBinding } from "./BindingHttp.js";
import { UpdateJobStatus } from "./UpdateJobStatus.js";
export const UpdateJobStatusHttp = Layer.effect(UpdateJobStatus, makeS3ControlAccountHttpBinding({
    tag: "AWS.S3Control.UpdateJobStatus",
    operation: s3control.updateJobStatus,
    actions: ["s3:UpdateJobStatus"],
}));
//# sourceMappingURL=UpdateJobStatusHttp.js.map