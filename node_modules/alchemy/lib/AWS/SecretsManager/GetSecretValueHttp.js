import * as secretsmanager from "@distilled.cloud/aws/secrets-manager";
import * as Layer from "effect/Layer";
import { makeSecretHttpBinding } from "./BindingHttp.js";
import { GetSecretValue } from "./GetSecretValue.js";
export const GetSecretValueHttp = Layer.effect(GetSecretValue, makeSecretHttpBinding({
    tag: "AWS.SecretsManager.GetSecretValue",
    operation: secretsmanager.getSecretValue,
    actions: ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"],
}));
//# sourceMappingURL=GetSecretValueHttp.js.map