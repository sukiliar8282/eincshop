import * as iotw from "@distilled.cloud/aws/iot-wireless";
import * as Layer from "effect/Layer";
import { makeIotWirelessGatewayHttpBinding } from "./BindingHttp.js";
import { GetWirelessGatewayStatistics, } from "./GetWirelessGatewayStatistics.js";
export const GetWirelessGatewayStatisticsHttp = Layer.effect(GetWirelessGatewayStatistics, makeIotWirelessGatewayHttpBinding({
    capability: "GetWirelessGatewayStatistics",
    iamActions: ["iotwireless:GetWirelessGatewayStatistics"],
    operation: iotw.getWirelessGatewayStatistics,
    prepare: (request, wirelessGatewayId) => ({
        ...request,
        WirelessGatewayId: wirelessGatewayId,
    }),
}));
//# sourceMappingURL=GetWirelessGatewayStatisticsHttp.js.map