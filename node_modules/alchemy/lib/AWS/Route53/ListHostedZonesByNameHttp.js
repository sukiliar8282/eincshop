import * as route53 from "@distilled.cloud/aws/route-53";
import * as Layer from "effect/Layer";
import { makeRoute53AccountHttpBinding } from "./BindingHttp.js";
import { ListHostedZonesByName } from "./ListHostedZonesByName.js";
export const ListHostedZonesByNameHttp = Layer.effect(ListHostedZonesByName, makeRoute53AccountHttpBinding({
    tag: "AWS.Route53.ListHostedZonesByName",
    operation: route53.listHostedZonesByName,
    actions: ["route53:ListHostedZonesByName"],
}));
//# sourceMappingURL=ListHostedZonesByNameHttp.js.map