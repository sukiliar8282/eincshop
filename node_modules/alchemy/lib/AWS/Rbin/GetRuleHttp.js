import * as rbin from "@distilled.cloud/aws/rbin";
import * as Layer from "effect/Layer";
import { makeRbinRuleHttpBinding } from "./BindingHttp.js";
import { GetRule } from "./GetRule.js";
export const GetRuleHttp = Layer.effect(GetRule, makeRbinRuleHttpBinding({
    tag: "AWS.Rbin.GetRule",
    operation: rbin.getRule,
    actions: ["rbin:GetRule"],
}));
//# sourceMappingURL=GetRuleHttp.js.map