import * as geoPlaces from "@distilled.cloud/aws/geo-places";
import * as Layer from "effect/Layer";
import { makeGeoPlacesHttpBinding } from "./BindingHttp.js";
import { Suggest } from "./Suggest.js";
export const SuggestHttp = Layer.effect(Suggest, makeGeoPlacesHttpBinding({
    capability: "Suggest",
    iamActions: ["geo-places:Suggest"],
    operation: geoPlaces.suggest,
}));
//# sourceMappingURL=SuggestHttp.js.map