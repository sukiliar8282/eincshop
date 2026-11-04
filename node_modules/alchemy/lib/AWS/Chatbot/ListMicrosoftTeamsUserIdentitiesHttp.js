import * as chatbot from "@distilled.cloud/aws/chatbot";
import * as Layer from "effect/Layer";
import { makeChatbotAccountHttpBinding } from "./BindingHttp.js";
import { ListMicrosoftTeamsUserIdentities } from "./ListMicrosoftTeamsUserIdentities.js";
export const ListMicrosoftTeamsUserIdentitiesHttp = Layer.effect(ListMicrosoftTeamsUserIdentities, makeChatbotAccountHttpBinding({
    tag: "AWS.Chatbot.ListMicrosoftTeamsUserIdentities",
    operation: chatbot.listMicrosoftTeamsUserIdentities,
    actions: ["chatbot:ListMicrosoftTeamsUserIdentities"],
}));
//# sourceMappingURL=ListMicrosoftTeamsUserIdentitiesHttp.js.map