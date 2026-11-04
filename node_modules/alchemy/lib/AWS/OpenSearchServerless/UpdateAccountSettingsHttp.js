import * as aoss from "@distilled.cloud/aws/opensearchserverless";
import * as Layer from "effect/Layer";
import { makeAossAccountHttpBinding } from "./BindingHttp.js";
import { UpdateAccountSettings } from "./UpdateAccountSettings.js";
export const UpdateAccountSettingsHttp = Layer.effect(UpdateAccountSettings, makeAossAccountHttpBinding({
    tag: "AWS.OpenSearchServerless.UpdateAccountSettings",
    operation: aoss.updateAccountSettings,
    actions: ["aoss:UpdateAccountSettings"],
}));
//# sourceMappingURL=UpdateAccountSettingsHttp.js.map