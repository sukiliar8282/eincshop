import * as notifications from "@distilled.cloud/aws/notifications";
import * as Layer from "effect/Layer";
import { makeNotificationsHttpBinding } from "./BindingHttp.js";
import { ListManagedNotificationEvents } from "./ListManagedNotificationEvents.js";
export const ListManagedNotificationEventsHttp = Layer.effect(ListManagedNotificationEvents, makeNotificationsHttpBinding({
    capability: "ListManagedNotificationEvents",
    iamActions: ["notifications:ListManagedNotificationEvents"],
    operation: notifications.listManagedNotificationEvents,
}));
//# sourceMappingURL=ListManagedNotificationEventsHttp.js.map