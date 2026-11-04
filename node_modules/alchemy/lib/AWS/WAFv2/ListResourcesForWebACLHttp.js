import * as wafv2 from "@distilled.cloud/aws/wafv2";
import * as Layer from "effect/Layer";
import { makeWafv2WebAclHttpBinding } from "./BindingHttp.js";
import { ListResourcesForWebACL } from "./ListResourcesForWebACL.js";
export const ListResourcesForWebACLHttp = Layer.effect(ListResourcesForWebACL, makeWafv2WebAclHttpBinding({
    tag: "AWS.WAFv2.ListResourcesForWebACL",
    operation: wafv2.listResourcesForWebACL,
    actions: ["wafv2:ListResourcesForWebACL"],
    inject: (acl) => ({ WebACLArn: acl.arn }),
}));
//# sourceMappingURL=ListResourcesForWebACLHttp.js.map