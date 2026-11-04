import * as socialmessaging from "@distilled.cloud/aws/socialmessaging";
import * as Layer from "effect/Layer";
import { makeWabaScopedHttpBinding } from "./BindingHttp.js";
import { ListWhatsAppFlows } from "./ListWhatsAppFlows.js";
export const ListWhatsAppFlowsHttp = Layer.effect(ListWhatsAppFlows, makeWabaScopedHttpBinding({
    tag: "AWS.SocialMessaging.ListWhatsAppFlows",
    operation: socialmessaging.listWhatsAppFlows,
    actions: ["social-messaging:ListWhatsAppFlows"],
}));
//# sourceMappingURL=ListWhatsAppFlowsHttp.js.map