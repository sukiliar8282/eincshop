import * as macie2 from "@distilled.cloud/aws/macie2";
import * as Layer from "effect/Layer";
import { makeMacie2HttpBinding } from "./BindingHttp.js";
import { SearchResources } from "./SearchResources.js";
export const SearchResourcesHttp = Layer.effect(SearchResources, makeMacie2HttpBinding({
    tag: "AWS.Macie2.SearchResources",
    operation: macie2.searchResources,
    actions: ["macie2:SearchResources"],
}));
//# sourceMappingURL=SearchResourcesHttp.js.map