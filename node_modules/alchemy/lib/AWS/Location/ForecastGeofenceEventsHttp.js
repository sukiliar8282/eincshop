import * as location from "@distilled.cloud/aws/location";
import * as Layer from "effect/Layer";
import { makeLocationCollectionHttpBinding } from "./BindingHttp.js";
import { ForecastGeofenceEvents } from "./ForecastGeofenceEvents.js";
export const ForecastGeofenceEventsHttp = Layer.effect(ForecastGeofenceEvents, makeLocationCollectionHttpBinding({
    tag: "AWS.Location.ForecastGeofenceEvents",
    operation: location.forecastGeofenceEvents,
    actions: ["geo:ForecastGeofenceEvents"],
}));
//# sourceMappingURL=ForecastGeofenceEventsHttp.js.map