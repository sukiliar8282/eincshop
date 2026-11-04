import * as location from "@distilled.cloud/aws/location";
import * as Layer from "effect/Layer";
import { makeLocationPlaceIndexHttpBinding } from "./BindingHttp.js";
import { SearchPlaceIndexForText } from "./SearchPlaceIndexForText.js";
export const SearchPlaceIndexForTextHttp = Layer.effect(SearchPlaceIndexForText, makeLocationPlaceIndexHttpBinding({
    tag: "AWS.Location.SearchPlaceIndexForText",
    operation: location.searchPlaceIndexForText,
    actions: ["geo:SearchPlaceIndexForText"],
}));
//# sourceMappingURL=SearchPlaceIndexForTextHttp.js.map