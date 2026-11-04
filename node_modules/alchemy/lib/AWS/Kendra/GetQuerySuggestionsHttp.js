import * as kendra from "@distilled.cloud/aws/kendra";
import * as Layer from "effect/Layer";
import { makeKendraIndexHttpBinding } from "./BindingHttp.js";
import { GetQuerySuggestions } from "./GetQuerySuggestions.js";
export const GetQuerySuggestionsHttp = Layer.effect(GetQuerySuggestions, makeKendraIndexHttpBinding({
    tag: "AWS.Kendra.GetQuerySuggestions",
    operation: kendra.getQuerySuggestions,
    actions: ["kendra:GetQuerySuggestions"],
}));
//# sourceMappingURL=GetQuerySuggestionsHttp.js.map