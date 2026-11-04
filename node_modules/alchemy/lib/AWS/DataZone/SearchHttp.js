import * as datazone from "@distilled.cloud/aws/datazone";
import * as Layer from "effect/Layer";
import { makeDataZoneDomainHttpBinding } from "./BindingHttp.js";
import { Search } from "./Search.js";
export const SearchHttp = Layer.effect(Search, makeDataZoneDomainHttpBinding({
    tag: "AWS.DataZone.Search",
    operation: datazone.search,
    actions: ["datazone:Search"],
}));
//# sourceMappingURL=SearchHttp.js.map