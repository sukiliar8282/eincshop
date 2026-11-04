import * as qbusiness from "@distilled.cloud/aws/qbusiness";
import * as Layer from "effect/Layer";
import { makeQBusinessApplicationHttpBinding } from "./BindingHttp.js";
import { GetChatControlsConfiguration } from "./GetChatControlsConfiguration.js";
export const GetChatControlsConfigurationHttp = Layer.effect(GetChatControlsConfiguration, makeQBusinessApplicationHttpBinding({
    tag: "AWS.QBusiness.GetChatControlsConfiguration",
    operation: qbusiness.getChatControlsConfiguration,
    actions: ["qbusiness:GetChatControlsConfiguration"],
}));
//# sourceMappingURL=GetChatControlsConfigurationHttp.js.map