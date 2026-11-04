import * as r53r from "@distilled.cloud/aws/route53resolver";
import * as Layer from "effect/Layer";
import { makeRoute53ResolverEndpointHttpBinding } from "./BindingHttp.js";
import { ListResolverEndpointIpAddresses } from "./ListResolverEndpointIpAddresses.js";
export const ListResolverEndpointIpAddressesHttp = Layer.effect(ListResolverEndpointIpAddresses, makeRoute53ResolverEndpointHttpBinding({
    tag: "AWS.Route53Resolver.ListResolverEndpointIpAddresses",
    operation: r53r.listResolverEndpointIpAddresses,
    actions: ["route53resolver:ListResolverEndpointIpAddresses"],
}));
//# sourceMappingURL=ListResolverEndpointIpAddressesHttp.js.map