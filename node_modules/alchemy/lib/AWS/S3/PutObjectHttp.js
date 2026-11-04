import * as S3 from "@distilled.cloud/aws/s3";
import * as Layer from "effect/Layer";
import { makeBucketHttpBinding } from "./BindingHttp.js";
import { PutObject } from "./PutObject.js";
export const PutObjectHttp = Layer.effect(PutObject, makeBucketHttpBinding({
    tag: "AWS.S3.PutObject",
    operation: S3.putObject,
    actions: ["s3:PutObject"],
}));
//# sourceMappingURL=PutObjectHttp.js.map