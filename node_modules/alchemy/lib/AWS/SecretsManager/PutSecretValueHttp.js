import * as secretsmanager from "@distilled.cloud/aws/secrets-manager";
import * as Layer from "effect/Layer";
import { makeSecretHttpBinding } from "./BindingHttp.js";
import { PutSecretValue } from "./PutSecretValue.js";
export const PutSecretValueHttp = Layer.effect(PutSecretValue, makeSecretHttpBinding({
    tag: "AWS.SecretsManager.PutSecretValue",
    operation: secretsmanager.putSecretValue,
    actions: ["secretsmanager:PutSecretValue", "secretsmanager:DescribeSecret"],
}));
//# sourceMappingURL=PutSecretValueHttp.js.map