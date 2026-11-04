import * as location from "@distilled.cloud/aws/location";
import * as Layer from "effect/Layer";
import { makeLocationCollectionHttpBinding } from "./BindingHttp.js";
import { PutGeofence } from "./PutGeofence.js";
export const PutGeofenceHttp = Layer.effect(PutGeofence, makeLocationCollectionHttpBinding({
    tag: "AWS.Location.PutGeofence",
    operation: location.putGeofence,
    actions: ["geo:PutGeofence"],
}));
//# sourceMappingURL=PutGeofenceHttp.js.map