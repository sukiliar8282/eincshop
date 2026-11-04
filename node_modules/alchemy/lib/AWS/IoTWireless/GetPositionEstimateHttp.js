import * as iotw from "@distilled.cloud/aws/iot-wireless";
import * as Layer from "effect/Layer";
import { makeIotWirelessAccountHttpBinding } from "./BindingHttp.js";
import { GetPositionEstimate } from "./GetPositionEstimate.js";
export const GetPositionEstimateHttp = Layer.effect(GetPositionEstimate, makeIotWirelessAccountHttpBinding({
    capability: "GetPositionEstimate",
    iamActions: ["iotwireless:GetPositionEstimate"],
    operation: iotw.getPositionEstimate,
    prepare: (request) => request,
}));
//# sourceMappingURL=GetPositionEstimateHttp.js.map