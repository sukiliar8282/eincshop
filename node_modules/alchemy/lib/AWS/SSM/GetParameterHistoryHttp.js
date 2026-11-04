import * as SSM from "@distilled.cloud/aws/ssm";
import * as Layer from "effect/Layer";
import { makeParameterHttpBinding } from "./BindingHttp.js";
import { GetParameterHistory } from "./GetParameterHistory.js";
export const GetParameterHistoryHttp = Layer.effect(GetParameterHistory, makeParameterHttpBinding({
    tag: "AWS.SSM.GetParameterHistory",
    operation: SSM.getParameterHistory,
    actions: ["ssm:GetParameterHistory"],
    // kms:Decrypt so `WithDecryption: true` works on SecureString parameters.
    kmsActions: ["kms:Decrypt"],
}));
//# sourceMappingURL=GetParameterHistoryHttp.js.map