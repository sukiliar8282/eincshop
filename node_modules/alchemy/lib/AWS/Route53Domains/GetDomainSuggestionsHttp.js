import * as route53domains from "@distilled.cloud/aws/route-53-domains";
import * as Layer from "effect/Layer";
import { makeRoute53DomainsHttpBinding } from "./BindingHttp.js";
import { GetDomainSuggestions } from "./GetDomainSuggestions.js";
export const GetDomainSuggestionsHttp = Layer.effect(GetDomainSuggestions, makeRoute53DomainsHttpBinding({
    capability: "GetDomainSuggestions",
    iamActions: ["route53domains:GetDomainSuggestions"],
    operation: route53domains.getDomainSuggestions,
}));
//# sourceMappingURL=GetDomainSuggestionsHttp.js.map