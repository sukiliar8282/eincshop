import * as location from "@distilled.cloud/aws/location";
import * as Layer from "effect/Layer";
import { makeLocationTrackerHttpBinding } from "./BindingHttp.js";
import { GetDevicePositionHistory } from "./GetDevicePositionHistory.js";
export const GetDevicePositionHistoryHttp = Layer.effect(GetDevicePositionHistory, makeLocationTrackerHttpBinding({
    tag: "AWS.Location.GetDevicePositionHistory",
    operation: location.getDevicePositionHistory,
    actions: ["geo:GetDevicePositionHistory"],
}));
//# sourceMappingURL=GetDevicePositionHistoryHttp.js.map