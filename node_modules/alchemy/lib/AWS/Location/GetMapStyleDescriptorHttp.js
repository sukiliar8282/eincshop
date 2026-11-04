import * as location from "@distilled.cloud/aws/location";
import * as Layer from "effect/Layer";
import { makeLocationMapHttpBinding } from "./BindingHttp.js";
import { GetMapStyleDescriptor } from "./GetMapStyleDescriptor.js";
export const GetMapStyleDescriptorHttp = Layer.effect(GetMapStyleDescriptor, makeLocationMapHttpBinding({
    tag: "AWS.Location.GetMapStyleDescriptor",
    operation: location.getMapStyleDescriptor,
    actions: ["geo:GetMapStyleDescriptor"],
}));
//# sourceMappingURL=GetMapStyleDescriptorHttp.js.map