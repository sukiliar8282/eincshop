import * as socialmessaging from "@distilled.cloud/aws/socialmessaging";
import * as Layer from "effect/Layer";
import { makeWabaScopedHttpBinding } from "./BindingHttp.js";
import { GetWhatsAppFlowPreview } from "./GetWhatsAppFlowPreview.js";
export const GetWhatsAppFlowPreviewHttp = Layer.effect(GetWhatsAppFlowPreview, makeWabaScopedHttpBinding({
    tag: "AWS.SocialMessaging.GetWhatsAppFlowPreview",
    operation: socialmessaging.getWhatsAppFlowPreview,
    actions: ["social-messaging:GetWhatsAppFlowPreview"],
}));
//# sourceMappingURL=GetWhatsAppFlowPreviewHttp.js.map