import * as rum from "@distilled.cloud/aws/rum";
import * as Layer from "effect/Layer";
import { makeRumAppMonitorHttpBinding } from "./BindingHttp.js";
import { GetAppMonitorData } from "./GetAppMonitorData.js";
export const GetAppMonitorDataHttp = Layer.effect(GetAppMonitorData, makeRumAppMonitorHttpBinding({
    tag: "AWS.RUM.GetAppMonitorData",
    operation: rum.getAppMonitorData,
    actions: ["rum:GetAppMonitorData"],
}));
//# sourceMappingURL=GetAppMonitorDataHttp.js.map