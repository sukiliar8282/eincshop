import * as datazone from "@distilled.cloud/aws/datazone";
import * as Layer from "effect/Layer";
import { makeDataZoneDomainHttpBinding } from "./BindingHttp.js";
import { SearchListings } from "./SearchListings.js";
export const SearchListingsHttp = Layer.effect(SearchListings, makeDataZoneDomainHttpBinding({
    tag: "AWS.DataZone.SearchListings",
    operation: datazone.searchListings,
    actions: ["datazone:SearchListings"],
}));
//# sourceMappingURL=SearchListingsHttp.js.map