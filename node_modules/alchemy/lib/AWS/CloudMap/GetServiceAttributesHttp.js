import * as SD from "@distilled.cloud/aws/servicediscovery";
import * as Layer from "effect/Layer";
import { makeCloudMapServiceHttpBinding } from "./BindingHttp.js";
import { GetServiceAttributes } from "./GetServiceAttributes.js";
export const GetServiceAttributesHttp = Layer.effect(GetServiceAttributes, makeCloudMapServiceHttpBinding({
    tag: "AWS.CloudMap.GetServiceAttributes",
    operation: SD.getServiceAttributes,
    actions: ["servicediscovery:GetServiceAttributes"],
}));
//# sourceMappingURL=GetServiceAttributesHttp.js.map