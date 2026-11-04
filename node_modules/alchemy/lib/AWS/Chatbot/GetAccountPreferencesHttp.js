import * as chatbot from "@distilled.cloud/aws/chatbot";
import * as Layer from "effect/Layer";
import { makeChatbotAccountHttpBinding } from "./BindingHttp.js";
import { GetAccountPreferences } from "./GetAccountPreferences.js";
export const GetAccountPreferencesHttp = Layer.effect(GetAccountPreferences, makeChatbotAccountHttpBinding({
    tag: "AWS.Chatbot.GetAccountPreferences",
    operation: chatbot.getAccountPreferences,
    actions: ["chatbot:GetAccountPreferences"],
}));
//# sourceMappingURL=GetAccountPreferencesHttp.js.map