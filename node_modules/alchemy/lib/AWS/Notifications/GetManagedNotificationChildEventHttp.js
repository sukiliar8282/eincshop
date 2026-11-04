import * as notifications from "@distilled.cloud/aws/notifications";
import * as Layer from "effect/Layer";
import { makeNotificationsHttpBinding } from "./BindingHttp.js";
import { GetManagedNotificationChildEvent } from "./GetManagedNotificationChildEvent.js";
export const GetManagedNotificationChildEventHttp = Layer.effect(GetManagedNotificationChildEvent, makeNotificationsHttpBinding({
    capability: "GetManagedNotificationChildEvent",
    iamActions: ["notifications:GetManagedNotificationChildEvent"],
    operation: notifications.getManagedNotificationChildEvent,
}));
//# sourceMappingURL=GetManagedNotificationChildEventHttp.js.map