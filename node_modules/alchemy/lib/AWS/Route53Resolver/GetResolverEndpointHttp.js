import * as r53r from "@distilled.cloud/aws/route53resolver";
import * as Layer from "effect/Layer";
import { makeRoute53ResolverEndpointHttpBinding } from "./BindingHttp.js";
import { GetResolverEndpoint } from "./GetResolverEndpoint.js";
export const GetResolverEndpointHttp = Layer.effect(GetResolverEndpoint, makeRoute53ResolverEndpointHttpBinding({
    tag: "AWS.Route53Resolver.GetResolverEndpoint",
    operation: r53r.getResolverEndpoint,
    actions: ["route53resolver:GetResolverEndpoint"],
}));
//# sourceMappingURL=GetResolverEndpointHttp.js.map