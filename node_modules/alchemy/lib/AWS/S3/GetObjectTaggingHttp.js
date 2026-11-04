import * as S3 from "@distilled.cloud/aws/s3";
import * as Layer from "effect/Layer";
import { makeBucketHttpBinding } from "./BindingHttp.js";
import { GetObjectTagging } from "./GetObjectTagging.js";
export const GetObjectTaggingHttp = Layer.effect(GetObjectTagging, makeBucketHttpBinding({
    tag: "AWS.S3.GetObjectTagging",
    operation: S3.getObjectTagging,
    actions: ["s3:GetObjectTagging", "s3:GetObjectVersionTagging"],
}));
//# sourceMappingURL=GetObjectTaggingHttp.js.map