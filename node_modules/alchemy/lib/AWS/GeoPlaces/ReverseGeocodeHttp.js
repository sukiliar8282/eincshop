import * as geoPlaces from "@distilled.cloud/aws/geo-places";
import * as Layer from "effect/Layer";
import { makeGeoPlacesHttpBinding } from "./BindingHttp.js";
import { ReverseGeocode } from "./ReverseGeocode.js";
export const ReverseGeocodeHttp = Layer.effect(ReverseGeocode, makeGeoPlacesHttpBinding({
    capability: "ReverseGeocode",
    iamActions: ["geo-places:ReverseGeocode"],
    operation: geoPlaces.reverseGeocode,
}));
//# sourceMappingURL=ReverseGeocodeHttp.js.map