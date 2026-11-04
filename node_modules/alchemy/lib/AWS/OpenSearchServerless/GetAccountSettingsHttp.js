import * as aoss from "@distilled.cloud/aws/opensearchserverless";
import * as Layer from "effect/Layer";
import { makeAossAccountHttpBinding } from "./BindingHttp.js";
import { GetAccountSettings } from "./GetAccountSettings.js";
export const GetAccountSettingsHttp = Layer.effect(GetAccountSettings, makeAossAccountHttpBinding({
    tag: "AWS.OpenSearchServerless.GetAccountSettings",
    operation: aoss.getAccountSettings,
    actions: ["aoss:GetAccountSettings"],
}));
//# sourceMappingURL=GetAccountSettingsHttp.js.map