import * as socialmessaging from "@distilled.cloud/aws/socialmessaging";
import * as Layer from "effect/Layer";
import { makeWabaScopedHttpBinding } from "./BindingHttp.js";
import { ListWhatsAppFlowAssets } from "./ListWhatsAppFlowAssets.js";
export const ListWhatsAppFlowAssetsHttp = Layer.effect(ListWhatsAppFlowAssets, makeWabaScopedHttpBinding({
    tag: "AWS.SocialMessaging.ListWhatsAppFlowAssets",
    operation: socialmessaging.listWhatsAppFlowAssets,
    actions: ["social-messaging:ListWhatsAppFlowAssets"],
}));
//# sourceMappingURL=ListWhatsAppFlowAssetsHttp.js.map