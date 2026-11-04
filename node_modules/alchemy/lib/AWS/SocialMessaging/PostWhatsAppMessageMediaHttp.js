import * as socialmessaging from "@distilled.cloud/aws/socialmessaging";
import * as Layer from "effect/Layer";
import { makeWabaPhonePlaneHttpBinding } from "./BindingHttp.js";
import { PostWhatsAppMessageMedia } from "./PostWhatsAppMessageMedia.js";
export const PostWhatsAppMessageMediaHttp = Layer.effect(PostWhatsAppMessageMedia, makeWabaPhonePlaneHttpBinding({
    tag: "AWS.SocialMessaging.PostWhatsAppMessageMedia",
    operation: socialmessaging.postWhatsAppMessageMedia,
    actions: ["social-messaging:PostWhatsAppMessageMedia"],
}));
//# sourceMappingURL=PostWhatsAppMessageMediaHttp.js.map