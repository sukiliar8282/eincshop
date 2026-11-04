import * as iotw from "@distilled.cloud/aws/iot-wireless";
import * as Layer from "effect/Layer";
import { makeIotWirelessAccountHttpBinding } from "./BindingHttp.js";
import { GetServiceEndpoint } from "./GetServiceEndpoint.js";
export const GetServiceEndpointHttp = Layer.effect(GetServiceEndpoint, makeIotWirelessAccountHttpBinding({
    capability: "GetServiceEndpoint",
    iamActions: ["iotwireless:GetServiceEndpoint"],
    operation: iotw.getServiceEndpoint,
    prepare: (request) => request ?? {},
}));
//# sourceMappingURL=GetServiceEndpointHttp.js.map