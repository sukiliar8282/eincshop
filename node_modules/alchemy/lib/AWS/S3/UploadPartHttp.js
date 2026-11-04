import * as S3 from "@distilled.cloud/aws/s3";
import * as Layer from "effect/Layer";
import { makeBucketHttpBinding } from "./BindingHttp.js";
import { UploadPart } from "./UploadPart.js";
export const UploadPartHttp = Layer.effect(UploadPart, makeBucketHttpBinding({
    tag: "AWS.S3.UploadPart",
    operation: S3.uploadPart,
    actions: ["s3:PutObject"],
}));
//# sourceMappingURL=UploadPartHttp.js.map