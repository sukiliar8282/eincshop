import * as secretsmanager from "@distilled.cloud/aws/secrets-manager";
import * as Layer from "effect/Layer";
import { makeSecretsManagerAccountHttpBinding } from "./BindingHttp.js";
import { ListSecrets } from "./ListSecrets.js";
export const ListSecretsHttp = Layer.effect(ListSecrets, makeSecretsManagerAccountHttpBinding({
    tag: "AWS.SecretsManager.ListSecrets",
    operation: secretsmanager.listSecrets,
    actions: ["secretsmanager:ListSecrets"],
}));
//# sourceMappingURL=ListSecretsHttp.js.map