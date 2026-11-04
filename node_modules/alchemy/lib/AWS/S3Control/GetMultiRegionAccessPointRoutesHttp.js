import * as s3control from "@distilled.cloud/aws/s3-control";
import * as Layer from "effect/Layer";
import { makeS3ControlMrapHttpBinding } from "./BindingHttp.js";
import { GetMultiRegionAccessPointRoutes } from "./GetMultiRegionAccessPointRoutes.js";
export const GetMultiRegionAccessPointRoutesHttp = Layer.effect(GetMultiRegionAccessPointRoutes, makeS3ControlMrapHttpBinding({
    tag: "AWS.S3Control.GetMultiRegionAccessPointRoutes",
    operation: s3control.getMultiRegionAccessPointRoutes,
    actions: ["s3:GetMultiRegionAccessPointRoutes"],
}));
//# sourceMappingURL=GetMultiRegionAccessPointRoutesHttp.js.map