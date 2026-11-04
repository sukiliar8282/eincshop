import * as im from "@distilled.cloud/aws/internetmonitor";
import * as Layer from "effect/Layer";
import { makeInternetMonitorMonitorHttpBinding } from "./BindingHttp.js";
import { GetHealthEvent } from "./GetHealthEvent.js";
export const GetHealthEventHttp = Layer.effect(GetHealthEvent, makeInternetMonitorMonitorHttpBinding({
    tag: "AWS.InternetMonitor.GetHealthEvent",
    operation: im.getHealthEvent,
    actions: ["internetmonitor:GetHealthEvent"],
}));
//# sourceMappingURL=GetHealthEventHttp.js.map