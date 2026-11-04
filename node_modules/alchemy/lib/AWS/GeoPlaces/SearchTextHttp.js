import * as geoPlaces from "@distilled.cloud/aws/geo-places";
import * as Layer from "effect/Layer";
import { makeGeoPlacesHttpBinding } from "./BindingHttp.js";
import { SearchText } from "./SearchText.js";
export const SearchTextHttp = Layer.effect(SearchText, makeGeoPlacesHttpBinding({
    capability: "SearchText",
    iamActions: ["geo-places:SearchText"],
    operation: geoPlaces.searchText,
}));
//# sourceMappingURL=SearchTextHttp.js.map