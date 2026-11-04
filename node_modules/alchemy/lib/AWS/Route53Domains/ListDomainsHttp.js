import * as route53domains from "@distilled.cloud/aws/route-53-domains";
import * as Layer from "effect/Layer";
import { makeRoute53DomainsHttpBinding } from "./BindingHttp.js";
import { ListDomains } from "./ListDomains.js";
export const ListDomainsHttp = Layer.effect(ListDomains, makeRoute53DomainsHttpBinding({
    capability: "ListDomains",
    iamActions: ["route53domains:ListDomains"],
    operation: route53domains.listDomains,
}));
//# sourceMappingURL=ListDomainsHttp.js.map