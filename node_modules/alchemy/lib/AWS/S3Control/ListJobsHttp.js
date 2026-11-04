import * as s3control from "@distilled.cloud/aws/s3-control";
import * as Layer from "effect/Layer";
import { makeS3ControlAccountHttpBinding } from "./BindingHttp.js";
import { ListJobs } from "./ListJobs.js";
export const ListJobsHttp = Layer.effect(ListJobs, makeS3ControlAccountHttpBinding({
    tag: "AWS.S3Control.ListJobs",
    operation: s3control.listJobs,
    actions: ["s3:ListJobs"],
}));
//# sourceMappingURL=ListJobsHttp.js.map