import * as chatbot from "@distilled.cloud/aws/chatbot";
import * as Layer from "effect/Layer";
import { makeChatbotAccountHttpBinding } from "./BindingHttp.js";
import { UpdateAccountPreferences } from "./UpdateAccountPreferences.js";
export const UpdateAccountPreferencesHttp = Layer.effect(UpdateAccountPreferences, makeChatbotAccountHttpBinding({
    tag: "AWS.Chatbot.UpdateAccountPreferences",
    operation: chatbot.updateAccountPreferences,
    actions: ["chatbot:UpdateAccountPreferences"],
}));
//# sourceMappingURL=UpdateAccountPreferencesHttp.js.map