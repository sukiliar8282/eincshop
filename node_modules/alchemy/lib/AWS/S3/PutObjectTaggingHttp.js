import * as S3 from "@distilled.cloud/aws/s3";
import * as Layer from "effect/Layer";
import { makeBucketHttpBinding } from "./BindingHttp.js";
import { PutObjectTagging } from "./PutObjectTagging.js";
export const PutObjectTaggingHttp = Layer.effect(PutObjectTagging, makeBucketHttpBinding({
    tag: "AWS.S3.PutObjectTagging",
    operation: S3.putObjectTagging,
    actions: ["s3:PutObjectTagging", "s3:PutObjectVersionTagging"],
}));
//# sourceMappingURL=PutObjectTaggingHttp.js.map