import * as socialmessaging from "@distilled.cloud/aws/socialmessaging";
import * as Layer from "effect/Layer";
import { makeWabaScopedHttpBinding } from "./BindingHttp.js";
import { ListWhatsAppTemplateLibrary } from "./ListWhatsAppTemplateLibrary.js";
export const ListWhatsAppTemplateLibraryHttp = Layer.effect(ListWhatsAppTemplateLibrary, makeWabaScopedHttpBinding({
    tag: "AWS.SocialMessaging.ListWhatsAppTemplateLibrary",
    operation: socialmessaging.listWhatsAppTemplateLibrary,
    actions: ["social-messaging:ListWhatsAppTemplateLibrary"],
}));
//# sourceMappingURL=ListWhatsAppTemplateLibraryHttp.js.map