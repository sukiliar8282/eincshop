import * as S3 from "@distilled.cloud/aws/s3";
import * as Layer from "effect/Layer";
import { makeBucketHttpBinding } from "./BindingHttp.js";
import { ListObjectVersions } from "./ListObjectVersions.js";
export const ListObjectVersionsHttp = Layer.effect(ListObjectVersions, makeBucketHttpBinding({
    tag: "AWS.S3.ListObjectVersions",
    operation: S3.listObjectVersions,
    actions: ["s3:ListBucketVersions"],
    iamResources: "bucket",
}));
//# sourceMappingURL=ListObjectVersionsHttp.js.map