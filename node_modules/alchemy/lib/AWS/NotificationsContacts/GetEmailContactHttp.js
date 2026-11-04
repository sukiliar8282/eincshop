import * as contacts from "@distilled.cloud/aws/notificationscontacts";
import * as Layer from "effect/Layer";
import { makeEmailContactHttpBinding } from "./BindingHttp.js";
import { GetEmailContact } from "./GetEmailContact.js";
export const GetEmailContactHttp = Layer.effect(GetEmailContact, makeEmailContactHttpBinding({
    tag: "AWS.NotificationsContacts.GetEmailContact",
    actions: ["notifications-contacts:GetEmailContact"],
    operation: contacts.getEmailContact,
}));
//# sourceMappingURL=GetEmailContactHttp.js.map