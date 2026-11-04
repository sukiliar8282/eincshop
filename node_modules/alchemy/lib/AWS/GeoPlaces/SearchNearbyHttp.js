import * as geoPlaces from "@distilled.cloud/aws/geo-places";
import * as Layer from "effect/Layer";
import { makeGeoPlacesHttpBinding } from "./BindingHttp.js";
import { SearchNearby } from "./SearchNearby.js";
export const SearchNearbyHttp = Layer.effect(SearchNearby, makeGeoPlacesHttpBinding({
    capability: "SearchNearby",
    iamActions: ["geo-places:SearchNearby"],
    operation: geoPlaces.searchNearby,
}));
//# sourceMappingURL=SearchNearbyHttp.js.map