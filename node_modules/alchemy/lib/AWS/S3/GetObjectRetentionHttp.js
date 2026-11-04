import * as S3 from "@distilled.cloud/aws/s3";
import * as Layer from "effect/Layer";
import { makeBucketHttpBinding } from "./BindingHttp.js";
import { GetObjectRetention } from "./GetObjectRetention.js";
export const GetObjectRetentionHttp = Layer.effect(GetObjectRetention, makeBucketHttpBinding({
    tag: "AWS.S3.GetObjectRetention",
    operation: S3.getObjectRetention,
    actions: ["s3:GetObjectRetention"],
}));
//# sourceMappingURL=GetObjectRetentionHttp.js.map