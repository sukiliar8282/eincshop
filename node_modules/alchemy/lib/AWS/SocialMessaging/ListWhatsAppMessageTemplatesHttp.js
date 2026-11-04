import * as socialmessaging from "@distilled.cloud/aws/socialmessaging";
import * as Layer from "effect/Layer";
import { makeWabaScopedHttpBinding } from "./BindingHttp.js";
import { ListWhatsAppMessageTemplates } from "./ListWhatsAppMessageTemplates.js";
export const ListWhatsAppMessageTemplatesHttp = Layer.effect(ListWhatsAppMessageTemplates, makeWabaScopedHttpBinding({
    tag: "AWS.SocialMessaging.ListWhatsAppMessageTemplates",
    operation: socialmessaging.listWhatsAppMessageTemplates,
    actions: ["social-messaging:ListWhatsAppMessageTemplates"],
}));
//# sourceMappingURL=ListWhatsAppMessageTemplatesHttp.js.map