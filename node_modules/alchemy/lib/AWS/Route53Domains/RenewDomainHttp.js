import * as route53domains from "@distilled.cloud/aws/route-53-domains";
import * as Layer from "effect/Layer";
import { makeRoute53DomainsHttpBinding } from "./BindingHttp.js";
import { RenewDomain } from "./RenewDomain.js";
export const RenewDomainHttp = Layer.effect(RenewDomain, makeRoute53DomainsHttpBinding({
    capability: "RenewDomain",
    iamActions: ["route53domains:RenewDomain"],
    operation: route53domains.renewDomain,
}));
//# sourceMappingURL=RenewDomainHttp.js.map