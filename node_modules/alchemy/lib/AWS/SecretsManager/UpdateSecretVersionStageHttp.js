import * as secretsmanager from "@distilled.cloud/aws/secrets-manager";
import * as Layer from "effect/Layer";
import { makeSecretHttpBinding } from "./BindingHttp.js";
import { UpdateSecretVersionStage } from "./UpdateSecretVersionStage.js";
export const UpdateSecretVersionStageHttp = Layer.effect(UpdateSecretVersionStage, makeSecretHttpBinding({
    tag: "AWS.SecretsManager.UpdateSecretVersionStage",
    operation: secretsmanager.updateSecretVersionStage,
    actions: ["secretsmanager:UpdateSecretVersionStage"],
}));
//# sourceMappingURL=UpdateSecretVersionStageHttp.js.map