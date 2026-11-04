import * as socialmessaging from "@distilled.cloud/aws/socialmessaging";
import * as Layer from "effect/Layer";
import { makeWabaScopedHttpBinding } from "./BindingHttp.js";
import { UpdateWhatsAppMessageTemplate } from "./UpdateWhatsAppMessageTemplate.js";
export const UpdateWhatsAppMessageTemplateHttp = Layer.effect(UpdateWhatsAppMessageTemplate, makeWabaScopedHttpBinding({
    tag: "AWS.SocialMessaging.UpdateWhatsAppMessageTemplate",
    operation: socialmessaging.updateWhatsAppMessageTemplate,
    actions: ["social-messaging:UpdateWhatsAppMessageTemplate"],
}));
//# sourceMappingURL=UpdateWhatsAppMessageTemplateHttp.js.map