import * as location from "@distilled.cloud/aws/location";
import * as Layer from "effect/Layer";
import { makeLocationPlaceIndexHttpBinding } from "./BindingHttp.js";
import { SearchPlaceIndexForSuggestions } from "./SearchPlaceIndexForSuggestions.js";
export const SearchPlaceIndexForSuggestionsHttp = Layer.effect(SearchPlaceIndexForSuggestions, makeLocationPlaceIndexHttpBinding({
    tag: "AWS.Location.SearchPlaceIndexForSuggestions",
    operation: location.searchPlaceIndexForSuggestions,
    actions: ["geo:SearchPlaceIndexForSuggestions"],
}));
//# sourceMappingURL=SearchPlaceIndexForSuggestionsHttp.js.map