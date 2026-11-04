import * as ram from "@distilled.cloud/aws/ram";
import * as Layer from "effect/Layer";
import { makeRAMHttpBinding } from "./BindingHttp.js";
import { GetResourcePolicies } from "./GetResourcePolicies.js";
export const GetResourcePoliciesHttp = Layer.effect(GetResourcePolicies, makeRAMHttpBinding({
    capability: "GetResourcePolicies",
    iamActions: ["ram:GetResourcePolicies"],
    operation: ram.getResourcePolicies,
}));
//# sourceMappingURL=GetResourcePoliciesHttp.js.map