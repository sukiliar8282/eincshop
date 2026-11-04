import * as notifications from "@distilled.cloud/aws/notifications";
import * as Layer from "effect/Layer";
import { makeNotificationsHttpBinding } from "./BindingHttp.js";
import { GetNotificationEvent } from "./GetNotificationEvent.js";
export const GetNotificationEventHttp = Layer.effect(GetNotificationEvent, makeNotificationsHttpBinding({
    capability: "GetNotificationEvent",
    iamActions: ["notifications:GetNotificationEvent"],
    operation: notifications.getNotificationEvent,
}));
//# sourceMappingURL=GetNotificationEventHttp.js.map