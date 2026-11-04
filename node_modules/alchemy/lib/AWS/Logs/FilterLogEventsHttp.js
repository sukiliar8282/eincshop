import * as Logs from "@distilled.cloud/aws/cloudwatch-logs";
import * as Layer from "effect/Layer";
import { makeLogGroupHttpBinding } from "./BindingHttp.js";
import { FilterLogEvents } from "./FilterLogEvents.js";
export const FilterLogEventsHttp = Layer.effect(FilterLogEvents, makeLogGroupHttpBinding({
    tag: "AWS.Logs.FilterLogEvents",
    operation: Logs.filterLogEvents,
    actions: ["logs:FilterLogEvents"],
}));
//# sourceMappingURL=FilterLogEventsHttp.js.map