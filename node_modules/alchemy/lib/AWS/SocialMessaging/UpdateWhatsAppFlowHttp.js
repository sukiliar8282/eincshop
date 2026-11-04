import * as socialmessaging from "@distilled.cloud/aws/socialmessaging";
import * as Layer from "effect/Layer";
import { makeWabaScopedHttpBinding } from "./BindingHttp.js";
import { UpdateWhatsAppFlow } from "./UpdateWhatsAppFlow.js";
export const UpdateWhatsAppFlowHttp = Layer.effect(UpdateWhatsAppFlow, makeWabaScopedHttpBinding({
    tag: "AWS.SocialMessaging.UpdateWhatsAppFlow",
    operation: socialmessaging.updateWhatsAppFlow,
    actions: ["social-messaging:UpdateWhatsAppFlow"],
}));
//# sourceMappingURL=UpdateWhatsAppFlowHttp.js.map