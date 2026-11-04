import * as socialmessaging from "@distilled.cloud/aws/socialmessaging";
import * as Layer from "effect/Layer";
import { makeWabaScopedHttpBinding } from "./BindingHttp.js";
import { PublishWhatsAppFlow } from "./PublishWhatsAppFlow.js";
export const PublishWhatsAppFlowHttp = Layer.effect(PublishWhatsAppFlow, makeWabaScopedHttpBinding({
    tag: "AWS.SocialMessaging.PublishWhatsAppFlow",
    operation: socialmessaging.publishWhatsAppFlow,
    actions: ["social-messaging:PublishWhatsAppFlow"],
}));
//# sourceMappingURL=PublishWhatsAppFlowHttp.js.map