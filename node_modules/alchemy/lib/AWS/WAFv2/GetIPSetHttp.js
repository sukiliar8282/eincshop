import * as wafv2 from "@distilled.cloud/aws/wafv2";
import * as Layer from "effect/Layer";
import { makeWafv2IPSetHttpBinding } from "./BindingHttp.js";
import { GetIPSet } from "./GetIPSet.js";
export const GetIPSetHttp = Layer.effect(GetIPSet, makeWafv2IPSetHttpBinding({
    tag: "AWS.WAFv2.GetIPSet",
    operation: wafv2.getIPSet,
    actions: ["wafv2:GetIPSet"],
}));
//# sourceMappingURL=GetIPSetHttp.js.map