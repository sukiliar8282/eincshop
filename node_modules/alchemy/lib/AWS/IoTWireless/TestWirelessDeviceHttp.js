import * as iotw from "@distilled.cloud/aws/iot-wireless";
import * as Layer from "effect/Layer";
import { makeIotWirelessDeviceHttpBinding } from "./BindingHttp.js";
import { TestWirelessDevice, } from "./TestWirelessDevice.js";
export const TestWirelessDeviceHttp = Layer.effect(TestWirelessDevice, makeIotWirelessDeviceHttpBinding({
    capability: "TestWirelessDevice",
    iamActions: ["iotwireless:TestWirelessDevice"],
    operation: iotw.testWirelessDevice,
    prepare: (request, wirelessDeviceId) => ({
        ...request,
        Id: wirelessDeviceId,
    }),
}));
//# sourceMappingURL=TestWirelessDeviceHttp.js.map