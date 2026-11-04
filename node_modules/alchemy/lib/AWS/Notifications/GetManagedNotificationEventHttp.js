import * as notifications from "@distilled.cloud/aws/notifications";
import * as Layer from "effect/Layer";
import { makeNotificationsHttpBinding } from "./BindingHttp.js";
import { GetManagedNotificationEvent } from "./GetManagedNotificationEvent.js";
export const GetManagedNotificationEventHttp = Layer.effect(GetManagedNotificationEvent, makeNotificationsHttpBinding({
    capability: "GetManagedNotificationEvent",
    iamActions: ["notifications:GetManagedNotificationEvent"],
    operation: notifications.getManagedNotificationEvent,
}));
//# sourceMappingURL=GetManagedNotificationEventHttp.js.map