import * as contacts from "@distilled.cloud/aws/notificationscontacts";
import * as Layer from "effect/Layer";
import { makeEmailContactHttpBinding } from "./BindingHttp.js";
import { SendActivationCode } from "./SendActivationCode.js";
export const SendActivationCodeHttp = Layer.effect(SendActivationCode, makeEmailContactHttpBinding({
    tag: "AWS.NotificationsContacts.SendActivationCode",
    actions: ["notifications-contacts:SendActivationCode"],
    operation: contacts.sendActivationCode,
}));
//# sourceMappingURL=SendActivationCodeHttp.js.map