import * as im from "@distilled.cloud/aws/internetmonitor";
import * as Layer from "effect/Layer";
import { makeInternetMonitorMonitorHttpBinding } from "./BindingHttp.js";
import { GetQueryStatus } from "./GetQueryStatus.js";
export const GetQueryStatusHttp = Layer.effect(GetQueryStatus, makeInternetMonitorMonitorHttpBinding({
    tag: "AWS.InternetMonitor.GetQueryStatus",
    operation: im.getQueryStatus,
    actions: ["internetmonitor:GetQueryStatus"],
}));
//# sourceMappingURL=GetQueryStatusHttp.js.map