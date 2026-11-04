import * as socialmessaging from "@distilled.cloud/aws/socialmessaging";
import * as Layer from "effect/Layer";
import { makeWabaPhonePlaneHttpBinding } from "./BindingHttp.js";
import { SendWhatsAppMessage } from "./SendWhatsAppMessage.js";
export const SendWhatsAppMessageHttp = Layer.effect(SendWhatsAppMessage, makeWabaPhonePlaneHttpBinding({
    tag: "AWS.SocialMessaging.SendWhatsAppMessage",
    operation: socialmessaging.sendWhatsAppMessage,
    actions: ["social-messaging:SendWhatsAppMessage"],
}));
//# sourceMappingURL=SendWhatsAppMessageHttp.js.map