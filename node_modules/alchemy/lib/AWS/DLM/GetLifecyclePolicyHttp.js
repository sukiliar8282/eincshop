import * as dlm from "@distilled.cloud/aws/dlm";
import * as Layer from "effect/Layer";
import { makeDlmPolicyHttpBinding } from "./BindingHttp.js";
import { GetLifecyclePolicy } from "./GetLifecyclePolicy.js";
export const GetLifecyclePolicyHttp = Layer.effect(GetLifecyclePolicy, makeDlmPolicyHttpBinding({
    tag: "AWS.DLM.GetLifecyclePolicy",
    operation: dlm.getLifecyclePolicy,
    actions: ["dlm:GetLifecyclePolicy"],
}));
//# sourceMappingURL=GetLifecyclePolicyHttp.js.map