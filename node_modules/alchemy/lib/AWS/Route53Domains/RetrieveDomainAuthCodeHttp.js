import * as route53domains from "@distilled.cloud/aws/route-53-domains";
import * as Layer from "effect/Layer";
import { makeRoute53DomainsHttpBinding } from "./BindingHttp.js";
import { RetrieveDomainAuthCode } from "./RetrieveDomainAuthCode.js";
export const RetrieveDomainAuthCodeHttp = Layer.effect(RetrieveDomainAuthCode, makeRoute53DomainsHttpBinding({
    capability: "RetrieveDomainAuthCode",
    iamActions: ["route53domains:RetrieveDomainAuthCode"],
    operation: route53domains.retrieveDomainAuthCode,
}));
//# sourceMappingURL=RetrieveDomainAuthCodeHttp.js.map