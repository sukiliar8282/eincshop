import * as Lambda from "@distilled.cloud/aws/lambda";
import * as Layer from "effect/Layer";
import { makeLambdaAccountHttpBinding } from "./BindingHttp.js";
import { GetAccountSettings } from "./GetAccountSettings.js";
export const GetAccountSettingsHttp = Layer.effect(GetAccountSettings, makeLambdaAccountHttpBinding({
    tag: "AWS.Lambda.GetAccountSettings",
    operation: Lambda.getAccountSettings,
    actions: ["lambda:GetAccountSettings"],
}));
//# sourceMappingURL=GetAccountSettingsHttp.js.map