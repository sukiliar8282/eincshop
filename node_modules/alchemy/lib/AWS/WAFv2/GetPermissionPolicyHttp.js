import * as wafv2 from "@distilled.cloud/aws/wafv2";
import * as Layer from "effect/Layer";
import { makeWafv2RuleGroupHttpBinding } from "./BindingHttp.js";
import { GetPermissionPolicy } from "./GetPermissionPolicy.js";
export const GetPermissionPolicyHttp = Layer.effect(GetPermissionPolicy, makeWafv2RuleGroupHttpBinding({
    tag: "AWS.WAFv2.GetPermissionPolicy",
    operation: wafv2.getPermissionPolicy,
    actions: ["wafv2:GetPermissionPolicy"],
}));
//# sourceMappingURL=GetPermissionPolicyHttp.js.map