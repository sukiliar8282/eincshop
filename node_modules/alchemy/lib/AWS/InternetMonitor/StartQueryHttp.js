import * as im from "@distilled.cloud/aws/internetmonitor";
import * as Layer from "effect/Layer";
import { makeInternetMonitorMonitorHttpBinding } from "./BindingHttp.js";
import { StartQuery } from "./StartQuery.js";
export const StartQueryHttp = Layer.effect(StartQuery, makeInternetMonitorMonitorHttpBinding({
    tag: "AWS.InternetMonitor.StartQuery",
    operation: im.startQuery,
    actions: ["internetmonitor:StartQuery"],
}));
//# sourceMappingURL=StartQueryHttp.js.map