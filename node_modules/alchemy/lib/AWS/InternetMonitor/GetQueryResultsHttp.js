import * as im from "@distilled.cloud/aws/internetmonitor";
import * as Layer from "effect/Layer";
import { makeInternetMonitorMonitorHttpBinding } from "./BindingHttp.js";
import { GetQueryResults } from "./GetQueryResults.js";
export const GetQueryResultsHttp = Layer.effect(GetQueryResults, makeInternetMonitorMonitorHttpBinding({
    tag: "AWS.InternetMonitor.GetQueryResults",
    operation: im.getQueryResults,
    actions: ["internetmonitor:GetQueryResults"],
}));
//# sourceMappingURL=GetQueryResultsHttp.js.map