import * as S3 from "@distilled.cloud/aws/s3";
import * as Layer from "effect/Layer";
import { makeBucketHttpBinding } from "./BindingHttp.js";
import { UploadPartCopy } from "./UploadPartCopy.js";
export const UploadPartCopyHttp = Layer.effect(UploadPartCopy, makeBucketHttpBinding({
    tag: "AWS.S3.UploadPartCopy",
    operation: S3.uploadPartCopy,
    actions: ["s3:PutObject", "s3:GetObject"],
}));
//# sourceMappingURL=UploadPartCopyHttp.js.map