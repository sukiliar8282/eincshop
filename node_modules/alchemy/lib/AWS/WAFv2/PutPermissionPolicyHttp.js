import * as wafv2 from "@distilled.cloud/aws/wafv2";
import * as Layer from "effect/Layer";
import { makeWafv2RuleGroupHttpBinding } from "./BindingHttp.js";
import { PutPermissionPolicy } from "./PutPermissionPolicy.js";
export const PutPermissionPolicyHttp = Layer.effect(PutPermissionPolicy, makeWafv2RuleGroupHttpBinding({
    tag: "AWS.WAFv2.PutPermissionPolicy",
    operation: wafv2.putPermissionPolicy,
    actions: ["wafv2:PutPermissionPolicy"],
}));
//# sourceMappingURL=PutPermissionPolicyHttp.js.map