import * as rum from "@distilled.cloud/aws/rum";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { bindRumAppMonitorPolicy } from "./BindingHttp.js";
import { PutRumEvents } from "./PutRumEvents.js";
/**
 * Bespoke (not `makeRumAppMonitorHttpBinding`): `PutRumEvents` addresses the
 * data-plane endpoint by monitor *id* (not name) and defaults the
 * `AppMonitorDetails` envelope from the bound monitor.
 */
export const PutRumEventsHttp = Layer.effect(PutRumEvents, Effect.gen(function* () {
    const op = yield* rum.putRumEvents;
    return Effect.fn(function* (monitor) {
        const monitorId = yield* monitor.appMonitorId;
        const monitorName = yield* monitor.appMonitorName;
        yield* bindRumAppMonitorPolicy({
            tag: "AWS.RUM.PutRumEvents",
            monitor,
            actions: ["rum:PutRumEvents"],
        });
        return Effect.fn(`AWS.RUM.PutRumEvents(${monitor.LogicalId})`)(function* (request) {
            const Id = yield* monitorId;
            return yield* op({
                ...request,
                Id,
                AppMonitorDetails: request.AppMonitorDetails ?? {
                    name: yield* monitorName,
                    id: Id,
                },
            });
        });
    });
}));
//# sourceMappingURL=PutRumEventsHttp.js.map