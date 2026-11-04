import * as iotw from "@distilled.cloud/aws/iot-wireless";
import * as Layer from "effect/Layer";
import { makeIotWirelessDeviceHttpBinding } from "./BindingHttp.js";
import { SendDataToWirelessDevice, } from "./SendDataToWirelessDevice.js";
export const SendDataToWirelessDeviceHttp = Layer.effect(SendDataToWirelessDevice, makeIotWirelessDeviceHttpBinding({
    capability: "SendDataToWirelessDevice",
    iamActions: ["iotwireless:SendDataToWirelessDevice"],
    operation: iotw.sendDataToWirelessDevice,
    prepare: (request, wirelessDeviceId) => ({
        ...request,
        Id: wirelessDeviceId,
    }),
}));
//# sourceMappingURL=SendDataToWirelessDeviceHttp.js.map