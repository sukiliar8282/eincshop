import * as cloudcontrol from "@distilled.cloud/aws/cloudcontrol";
import * as Layer from "effect/Layer";
import { makeCloudControlHttpBinding } from "./BindingHttp.js";
import { GetResourceRequestStatus } from "./GetResourceRequestStatus.js";
export const GetResourceRequestStatusHttp = Layer.effect(GetResourceRequestStatus, makeCloudControlHttpBinding({
    tag: "AWS.CloudControl.GetResourceRequestStatus",
    operation: cloudcontrol.getResourceRequestStatus,
    actions: ["cloudformation:GetResourceRequestStatus"],
}));
//# sourceMappingURL=GetResourceRequestStatusHttp.js.map