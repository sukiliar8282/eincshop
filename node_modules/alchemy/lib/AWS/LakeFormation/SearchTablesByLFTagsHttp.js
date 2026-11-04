import * as lf from "@distilled.cloud/aws/lakeformation";
import * as Layer from "effect/Layer";
import { makeLakeFormationHttpBinding } from "./BindingHttp.js";
import { SearchTablesByLFTags } from "./SearchTablesByLFTags.js";
export const SearchTablesByLFTagsHttp = Layer.effect(SearchTablesByLFTags, makeLakeFormationHttpBinding({
    capability: "SearchTablesByLFTags",
    iamActions: ["lakeformation:SearchTablesByLFTags"],
    operation: lf.searchTablesByLFTags,
}));
//# sourceMappingURL=SearchTablesByLFTagsHttp.js.map