import * as cloudcontrol from "@distilled.cloud/aws/cloudcontrol";
import * as Layer from "effect/Layer";
import { makeCloudControlHttpBinding } from "./BindingHttp.js";
import { GetResource } from "./GetResource.js";
export const GetResourceHttp = Layer.effect(GetResource, makeCloudControlHttpBinding({
    tag: "AWS.CloudControl.GetResource",
    operation: cloudcontrol.getResource,
    actions: ["cloudformation:GetResource"],
}));
//# sourceMappingURL=GetResourceHttp.js.map