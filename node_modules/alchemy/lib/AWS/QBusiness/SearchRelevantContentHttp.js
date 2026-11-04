import * as qbusiness from "@distilled.cloud/aws/qbusiness";
import * as Layer from "effect/Layer";
import { makeQBusinessApplicationHttpBinding } from "./BindingHttp.js";
import { SearchRelevantContent } from "./SearchRelevantContent.js";
export const SearchRelevantContentHttp = Layer.effect(SearchRelevantContent, makeQBusinessApplicationHttpBinding({
    tag: "AWS.QBusiness.SearchRelevantContent",
    operation: qbusiness.searchRelevantContent,
    actions: ["qbusiness:SearchRelevantContent"],
    subResources: ["retriever/*"],
}));
//# sourceMappingURL=SearchRelevantContentHttp.js.map