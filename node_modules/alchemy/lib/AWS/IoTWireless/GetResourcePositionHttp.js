import * as iotw from "@distilled.cloud/aws/iot-wireless";
import * as Layer from "effect/Layer";
import { makeIotWirelessDeviceHttpBinding } from "./BindingHttp.js";
import { GetResourcePosition, } from "./GetResourcePosition.js";
export const GetResourcePositionHttp = Layer.effect(GetResourcePosition, makeIotWirelessDeviceHttpBinding({
    capability: "GetResourcePosition",
    iamActions: ["iotwireless:GetResourcePosition"],
    // IoT Wireless authorizes the position APIs against a type-level ARN
    // (…:WirelessDevice/WirelessDevice) — the device ARN never matches.
    resourceScope: "any",
    operation: iotw.getResourcePosition,
    prepare: (request, wirelessDeviceId) => ({
        ...request,
        ResourceIdentifier: wirelessDeviceId,
        ResourceType: "WirelessDevice",
    }),
}));
//# sourceMappingURL=GetResourcePositionHttp.js.map