import * as im from "@distilled.cloud/aws/internetmonitor";
import * as Layer from "effect/Layer";
import { makeInternetMonitorAccountHttpBinding } from "./BindingHttp.js";
import { GetInternetEvent } from "./GetInternetEvent.js";
export const GetInternetEventHttp = Layer.effect(GetInternetEvent, makeInternetMonitorAccountHttpBinding({
    tag: "AWS.InternetMonitor.GetInternetEvent",
    operation: im.getInternetEvent,
    actions: ["internetmonitor:GetInternetEvent"],
}));
//# sourceMappingURL=GetInternetEventHttp.js.map