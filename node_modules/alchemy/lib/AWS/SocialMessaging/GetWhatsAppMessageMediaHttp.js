import * as socialmessaging from "@distilled.cloud/aws/socialmessaging";
import * as Layer from "effect/Layer";
import { makeWabaPhonePlaneHttpBinding } from "./BindingHttp.js";
import { GetWhatsAppMessageMedia } from "./GetWhatsAppMessageMedia.js";
export const GetWhatsAppMessageMediaHttp = Layer.effect(GetWhatsAppMessageMedia, makeWabaPhonePlaneHttpBinding({
    tag: "AWS.SocialMessaging.GetWhatsAppMessageMedia",
    operation: socialmessaging.getWhatsAppMessageMedia,
    actions: ["social-messaging:GetWhatsAppMessageMedia"],
}));
//# sourceMappingURL=GetWhatsAppMessageMediaHttp.js.map