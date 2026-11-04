import * as route53domains from "@distilled.cloud/aws/route-53-domains";
import * as Layer from "effect/Layer";
import { makeRoute53DomainsHttpBinding } from "./BindingHttp.js";
import { ListPrices } from "./ListPrices.js";
export const ListPricesHttp = Layer.effect(ListPrices, makeRoute53DomainsHttpBinding({
    capability: "ListPrices",
    iamActions: ["route53domains:ListPrices"],
    operation: route53domains.listPrices,
}));
//# sourceMappingURL=ListPricesHttp.js.map