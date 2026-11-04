import * as secretsmanager from "@distilled.cloud/aws/secrets-manager";
import * as Layer from "effect/Layer";
import { makeSecretHttpBinding } from "./BindingHttp.js";
import { RotateSecret } from "./RotateSecret.js";
export const RotateSecretHttp = Layer.effect(RotateSecret, makeSecretHttpBinding({
    tag: "AWS.SecretsManager.RotateSecret",
    operation: secretsmanager.rotateSecret,
    actions: ["secretsmanager:RotateSecret", "secretsmanager:DescribeSecret"],
}));
//# sourceMappingURL=RotateSecretHttp.js.map