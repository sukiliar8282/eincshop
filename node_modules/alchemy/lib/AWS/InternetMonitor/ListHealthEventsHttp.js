import * as im from "@distilled.cloud/aws/internetmonitor";
import * as Layer from "effect/Layer";
import { makeInternetMonitorMonitorHttpBinding } from "./BindingHttp.js";
import { ListHealthEvents } from "./ListHealthEvents.js";
export const ListHealthEventsHttp = Layer.effect(ListHealthEvents, makeInternetMonitorMonitorHttpBinding({
    tag: "AWS.InternetMonitor.ListHealthEvents",
    operation: im.listHealthEvents,
    actions: ["internetmonitor:ListHealthEvents"],
}));
//# sourceMappingURL=ListHealthEventsHttp.js.map