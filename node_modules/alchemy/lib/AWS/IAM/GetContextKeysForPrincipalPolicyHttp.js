import * as iam from "@distilled.cloud/aws/iam";
import * as Layer from "effect/Layer";
import { makeIamHttpBinding } from "./BindingHttp.js";
import { GetContextKeysForPrincipalPolicy } from "./GetContextKeysForPrincipalPolicy.js";
export const GetContextKeysForPrincipalPolicyHttp = Layer.effect(GetContextKeysForPrincipalPolicy, makeIamHttpBinding({
    capability: "GetContextKeysForPrincipalPolicy",
    iamActions: ["iam:GetContextKeysForPrincipalPolicy"],
    operation: iam.getContextKeysForPrincipalPolicy,
}));
//# sourceMappingURL=GetContextKeysForPrincipalPolicyHttp.js.map