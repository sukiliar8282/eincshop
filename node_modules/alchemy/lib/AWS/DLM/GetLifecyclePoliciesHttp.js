import * as dlm from "@distilled.cloud/aws/dlm";
import * as Layer from "effect/Layer";
import { makeDlmAccountHttpBinding } from "./BindingHttp.js";
import { GetLifecyclePolicies } from "./GetLifecyclePolicies.js";
export const GetLifecyclePoliciesHttp = Layer.effect(GetLifecyclePolicies, makeDlmAccountHttpBinding({
    tag: "AWS.DLM.GetLifecyclePolicies",
    operation: dlm.getLifecyclePolicies,
    actions: ["dlm:GetLifecyclePolicies"],
}));
//# sourceMappingURL=GetLifecyclePoliciesHttp.js.map