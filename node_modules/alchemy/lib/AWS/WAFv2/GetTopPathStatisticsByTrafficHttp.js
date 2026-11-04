import * as wafv2 from "@distilled.cloud/aws/wafv2";
import * as Layer from "effect/Layer";
import { makeWafv2WebAclHttpBinding } from "./BindingHttp.js";
import { GetTopPathStatisticsByTraffic } from "./GetTopPathStatisticsByTraffic.js";
export const GetTopPathStatisticsByTrafficHttp = Layer.effect(GetTopPathStatisticsByTraffic, makeWafv2WebAclHttpBinding({
    tag: "AWS.WAFv2.GetTopPathStatisticsByTraffic",
    operation: wafv2.getTopPathStatisticsByTraffic,
    actions: ["wafv2:GetTopPathStatisticsByTraffic"],
    inject: (acl) => ({ WebAclArn: acl.arn, Scope: acl.scope }),
}));
//# sourceMappingURL=GetTopPathStatisticsByTrafficHttp.js.map