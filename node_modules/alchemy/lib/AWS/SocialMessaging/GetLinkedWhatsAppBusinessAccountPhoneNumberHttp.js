import * as socialmessaging from "@distilled.cloud/aws/socialmessaging";
import * as Layer from "effect/Layer";
import { makeWabaPhonePlaneHttpBinding } from "./BindingHttp.js";
import { GetLinkedWhatsAppBusinessAccountPhoneNumber } from "./GetLinkedWhatsAppBusinessAccountPhoneNumber.js";
export const GetLinkedWhatsAppBusinessAccountPhoneNumberHttp = Layer.effect(GetLinkedWhatsAppBusinessAccountPhoneNumber, makeWabaPhonePlaneHttpBinding({
    tag: "AWS.SocialMessaging.GetLinkedWhatsAppBusinessAccountPhoneNumber",
    operation: socialmessaging.getLinkedWhatsAppBusinessAccountPhoneNumber,
    actions: ["social-messaging:GetLinkedWhatsAppBusinessAccountPhoneNumber"],
}));
//# sourceMappingURL=GetLinkedWhatsAppBusinessAccountPhoneNumberHttp.js.map