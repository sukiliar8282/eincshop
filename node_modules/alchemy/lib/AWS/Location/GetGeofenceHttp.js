import * as location from "@distilled.cloud/aws/location";
import * as Layer from "effect/Layer";
import { makeLocationCollectionHttpBinding } from "./BindingHttp.js";
import { GetGeofence } from "./GetGeofence.js";
export const GetGeofenceHttp = Layer.effect(GetGeofence, makeLocationCollectionHttpBinding({
    tag: "AWS.Location.GetGeofence",
    operation: location.getGeofence,
    actions: ["geo:GetGeofence"],
}));
//# sourceMappingURL=GetGeofenceHttp.js.map