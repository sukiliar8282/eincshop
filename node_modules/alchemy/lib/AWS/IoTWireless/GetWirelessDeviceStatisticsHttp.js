import * as iotw from "@distilled.cloud/aws/iot-wireless";
import * as Layer from "effect/Layer";
import { makeIotWirelessDeviceHttpBinding } from "./BindingHttp.js";
import { GetWirelessDeviceStatistics, } from "./GetWirelessDeviceStatistics.js";
export const GetWirelessDeviceStatisticsHttp = Layer.effect(GetWirelessDeviceStatistics, makeIotWirelessDeviceHttpBinding({
    capability: "GetWirelessDeviceStatistics",
    iamActions: ["iotwireless:GetWirelessDeviceStatistics"],
    operation: iotw.getWirelessDeviceStatistics,
    prepare: (request, wirelessDeviceId) => ({
        ...request,
        WirelessDeviceId: wirelessDeviceId,
    }),
}));
//# sourceMappingURL=GetWirelessDeviceStatisticsHttp.js.map