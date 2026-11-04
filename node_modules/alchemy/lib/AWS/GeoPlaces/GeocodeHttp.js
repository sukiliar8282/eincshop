import * as geoPlaces from "@distilled.cloud/aws/geo-places";
import * as Layer from "effect/Layer";
import { makeGeoPlacesHttpBinding } from "./BindingHttp.js";
import { Geocode } from "./Geocode.js";
export const GeocodeHttp = Layer.effect(Geocode, makeGeoPlacesHttpBinding({
    capability: "Geocode",
    iamActions: ["geo-places:Geocode"],
    operation: geoPlaces.geocode,
}));
//# sourceMappingURL=GeocodeHttp.js.map