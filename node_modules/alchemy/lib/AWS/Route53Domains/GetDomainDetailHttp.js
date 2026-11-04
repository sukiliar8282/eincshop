import * as route53domains from "@distilled.cloud/aws/route-53-domains";
import * as Layer from "effect/Layer";
import { makeRoute53DomainsHttpBinding } from "./BindingHttp.js";
import { GetDomainDetail } from "./GetDomainDetail.js";
export const GetDomainDetailHttp = Layer.effect(GetDomainDetail, makeRoute53DomainsHttpBinding({
    capability: "GetDomainDetail",
    iamActions: ["route53domains:GetDomainDetail"],
    operation: route53domains.getDomainDetail,
}));
//# sourceMappingURL=GetDomainDetailHttp.js.map