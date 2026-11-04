import * as geoPlaces from "@distilled.cloud/aws/geo-places";
import * as Layer from "effect/Layer";
import { makeGeoPlacesHttpBinding } from "./BindingHttp.js";
import { GetPlace } from "./GetPlace.js";
export const GetPlaceHttp = Layer.effect(GetPlace, makeGeoPlacesHttpBinding({
    capability: "GetPlace",
    iamActions: ["geo-places:GetPlace"],
    operation: geoPlaces.getPlace,
}));
//# sourceMappingURL=GetPlaceHttp.js.map