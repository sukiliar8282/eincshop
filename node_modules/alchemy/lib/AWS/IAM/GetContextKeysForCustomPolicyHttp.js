import * as iam from "@distilled.cloud/aws/iam";
import * as Layer from "effect/Layer";
import { makeIamHttpBinding } from "./BindingHttp.js";
import { GetContextKeysForCustomPolicy } from "./GetContextKeysForCustomPolicy.js";
export const GetContextKeysForCustomPolicyHttp = Layer.effect(GetContextKeysForCustomPolicy, makeIamHttpBinding({
    capability: "GetContextKeysForCustomPolicy",
    iamActions: ["iam:GetContextKeysForCustomPolicy"],
    operation: iam.getContextKeysForCustomPolicy,
}));
//# sourceMappingURL=GetContextKeysForCustomPolicyHttp.js.map