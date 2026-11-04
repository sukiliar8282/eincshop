import * as S3 from "@distilled.cloud/aws/s3";
import * as Layer from "effect/Layer";
import { makeBucketHttpBinding } from "./BindingHttp.js";
import { ListObjectsV2 } from "./ListObjectsV2.js";
export const ListObjectsV2Http = Layer.effect(ListObjectsV2, makeBucketHttpBinding({
    tag: "AWS.S3.ListObjectsV2",
    operation: S3.listObjectsV2,
    actions: ["s3:ListBucket"],
    iamResources: "bucket",
}));
//# sourceMappingURL=ListObjectsV2Http.js.map