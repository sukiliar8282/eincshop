import * as cloudcontrol from "@distilled.cloud/aws/cloudcontrol";
import * as Layer from "effect/Layer";
import { makeCloudControlHttpBinding } from "./BindingHttp.js";
import { UpdateResource } from "./UpdateResource.js";
export const UpdateResourceHttp = Layer.effect(UpdateResource, makeCloudControlHttpBinding({
    tag: "AWS.CloudControl.UpdateResource",
    operation: cloudcontrol.updateResource,
    actions: ["cloudformation:UpdateResource"],
}));
//# sourceMappingURL=UpdateResourceHttp.js.map