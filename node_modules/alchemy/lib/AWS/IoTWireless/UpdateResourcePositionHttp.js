import * as iotw from "@distilled.cloud/aws/iot-wireless";
import * as Layer from "effect/Layer";
import { makeIotWirelessDeviceHttpBinding } from "./BindingHttp.js";
import { UpdateResourcePosition, } from "./UpdateResourcePosition.js";
export const UpdateResourcePositionHttp = Layer.effect(UpdateResourcePosition, makeIotWirelessDeviceHttpBinding({
    capability: "UpdateResourcePosition",
    iamActions: ["iotwireless:UpdateResourcePosition"],
    // IoT Wireless authorizes the position APIs against a type-level ARN
    // (…:WirelessDevice/WirelessDevice) — the device ARN never matches.
    resourceScope: "any",
    operation: iotw.updateResourcePosition,
    prepare: (request, wirelessDeviceId) => ({
        ...request,
        ResourceIdentifier: wirelessDeviceId,
        ResourceType: "WirelessDevice",
    }),
}));
//# sourceMappingURL=UpdateResourcePositionHttp.js.map