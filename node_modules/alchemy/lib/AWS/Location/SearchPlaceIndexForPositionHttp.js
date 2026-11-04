import * as location from "@distilled.cloud/aws/location";
import * as Layer from "effect/Layer";
import { makeLocationPlaceIndexHttpBinding } from "./BindingHttp.js";
import { SearchPlaceIndexForPosition } from "./SearchPlaceIndexForPosition.js";
export const SearchPlaceIndexForPositionHttp = Layer.effect(SearchPlaceIndexForPosition, makeLocationPlaceIndexHttpBinding({
    tag: "AWS.Location.SearchPlaceIndexForPosition",
    operation: location.searchPlaceIndexForPosition,
    actions: ["geo:SearchPlaceIndexForPosition"],
}));
//# sourceMappingURL=SearchPlaceIndexForPositionHttp.js.map