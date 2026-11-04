import * as cloudcontrol from "@distilled.cloud/aws/cloudcontrol";
import * as Layer from "effect/Layer";
import { makeCloudControlHttpBinding } from "./BindingHttp.js";
import { ListResources } from "./ListResources.js";
export const ListResourcesHttp = Layer.effect(ListResources, makeCloudControlHttpBinding({
    tag: "AWS.CloudControl.ListResources",
    operation: cloudcontrol.listResources,
    actions: ["cloudformation:ListResources"],
}));
//# sourceMappingURL=ListResourcesHttp.js.map