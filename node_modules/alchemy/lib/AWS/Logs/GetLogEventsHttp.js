import * as Logs from "@distilled.cloud/aws/cloudwatch-logs";
import * as Layer from "effect/Layer";
import { makeLogGroupHttpBinding } from "./BindingHttp.js";
import { GetLogEvents } from "./GetLogEvents.js";
export const GetLogEventsHttp = Layer.effect(GetLogEvents, makeLogGroupHttpBinding({
    tag: "AWS.Logs.GetLogEvents",
    operation: Logs.getLogEvents,
    actions: ["logs:GetLogEvents"],
}));
//# sourceMappingURL=GetLogEventsHttp.js.map