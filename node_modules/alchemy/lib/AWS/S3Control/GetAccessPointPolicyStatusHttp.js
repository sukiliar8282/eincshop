import * as s3control from "@distilled.cloud/aws/s3-control";
import * as Layer from "effect/Layer";
import { makeS3ControlAccessPointHttpBinding } from "./BindingHttp.js";
import { GetAccessPointPolicyStatus } from "./GetAccessPointPolicyStatus.js";
export const GetAccessPointPolicyStatusHttp = Layer.effect(GetAccessPointPolicyStatus, makeS3ControlAccessPointHttpBinding({
    tag: "AWS.S3Control.GetAccessPointPolicyStatus",
    operation: s3control.getAccessPointPolicyStatus,
    actions: ["s3:GetAccessPointPolicyStatus"],
}));
//# sourceMappingURL=GetAccessPointPolicyStatusHttp.js.map