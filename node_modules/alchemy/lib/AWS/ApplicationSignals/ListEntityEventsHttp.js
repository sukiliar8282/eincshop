import * as appsignals from "@distilled.cloud/aws/application-signals";
import * as Layer from "effect/Layer";
import { makeApplicationSignalsAccountHttpBinding } from "./BindingHttp.js";
import { ListEntityEvents } from "./ListEntityEvents.js";
export const ListEntityEventsHttp = Layer.effect(ListEntityEvents, makeApplicationSignalsAccountHttpBinding({
    tag: "AWS.ApplicationSignals.ListEntityEvents",
    operation: appsignals.listEntityEvents,
    actions: ["application-signals:ListEntityEvents"],
}));
//# sourceMappingURL=ListEntityEventsHttp.js.map