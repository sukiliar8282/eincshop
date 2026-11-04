import * as S3 from "@distilled.cloud/aws/s3";
import * as Layer from "effect/Layer";
import { makeBucketHttpBinding } from "./BindingHttp.js";
import { GetObjectLegalHold } from "./GetObjectLegalHold.js";
export const GetObjectLegalHoldHttp = Layer.effect(GetObjectLegalHold, makeBucketHttpBinding({
    tag: "AWS.S3.GetObjectLegalHold",
    operation: S3.getObjectLegalHold,
    actions: ["s3:GetObjectLegalHold"],
}));
//# sourceMappingURL=GetObjectLegalHoldHttp.js.map