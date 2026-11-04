import * as resourcegroups from "@distilled.cloud/aws/resource-groups";
import * as Layer from "effect/Layer";
import { makeResourceGroupsAccountHttpBinding } from "./BindingHttp.js";
import { GetAccountSettings } from "./GetAccountSettings.js";
export const GetAccountSettingsHttp = Layer.effect(GetAccountSettings, makeResourceGroupsAccountHttpBinding({
    tag: "AWS.ResourceGroups.GetAccountSettings",
    operation: resourcegroups.getAccountSettings,
    actions: ["resource-groups:GetAccountSettings"],
}));
//# sourceMappingURL=GetAccountSettingsHttp.js.map