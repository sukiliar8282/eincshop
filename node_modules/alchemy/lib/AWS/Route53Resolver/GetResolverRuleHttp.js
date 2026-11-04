import * as r53r from "@distilled.cloud/aws/route53resolver";
import * as Layer from "effect/Layer";
import { makeRoute53ResolverRuleHttpBinding } from "./BindingHttp.js";
import { GetResolverRule } from "./GetResolverRule.js";
export const GetResolverRuleHttp = Layer.effect(GetResolverRule, makeRoute53ResolverRuleHttpBinding({
    tag: "AWS.Route53Resolver.GetResolverRule",
    operation: r53r.getResolverRule,
    actions: ["route53resolver:GetResolverRule"],
}));
//# sourceMappingURL=GetResolverRuleHttp.js.map