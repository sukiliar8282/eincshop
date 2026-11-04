import * as s3control from "@distilled.cloud/aws/s3-control";
import * as Layer from "effect/Layer";
import { makeS3ControlMrapHttpBinding } from "./BindingHttp.js";
import { SubmitMultiRegionAccessPointRoutes } from "./SubmitMultiRegionAccessPointRoutes.js";
export const SubmitMultiRegionAccessPointRoutesHttp = Layer.effect(SubmitMultiRegionAccessPointRoutes, makeS3ControlMrapHttpBinding({
    tag: "AWS.S3Control.SubmitMultiRegionAccessPointRoutes",
    operation: s3control.submitMultiRegionAccessPointRoutes,
    actions: ["s3:SubmitMultiRegionAccessPointRoutes"],
}));
//# sourceMappingURL=SubmitMultiRegionAccessPointRoutesHttp.js.map