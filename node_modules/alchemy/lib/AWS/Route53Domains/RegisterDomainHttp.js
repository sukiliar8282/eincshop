import * as route53domains from "@distilled.cloud/aws/route-53-domains";
import * as Layer from "effect/Layer";
import { makeRoute53DomainsHttpBinding } from "./BindingHttp.js";
import { RegisterDomain } from "./RegisterDomain.js";
export const RegisterDomainHttp = Layer.effect(RegisterDomain, makeRoute53DomainsHttpBinding({
    capability: "RegisterDomain",
    // RegisterDomain pre-validates that the caller can create the hosted
    // zone Route 53 auto-creates during registration — without
    // route53:CreateHostedZone the API rejects the call with
    // AccessDeniedException ("not authorized to perform:
    // route53:CreateHostedZone") before even validating the TLD.
    iamActions: ["route53domains:RegisterDomain", "route53:CreateHostedZone"],
    operation: route53domains.registerDomain,
}));
//# sourceMappingURL=RegisterDomainHttp.js.map