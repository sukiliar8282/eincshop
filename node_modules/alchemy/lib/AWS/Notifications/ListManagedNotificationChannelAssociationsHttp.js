import * as notifications from "@distilled.cloud/aws/notifications";
import * as Layer from "effect/Layer";
import { makeNotificationsHttpBinding } from "./BindingHttp.js";
import { ListManagedNotificationChannelAssociations } from "./ListManagedNotificationChannelAssociations.js";
export const ListManagedNotificationChannelAssociationsHttp = Layer.effect(ListManagedNotificationChannelAssociations, makeNotificationsHttpBinding({
    capability: "ListManagedNotificationChannelAssociations",
    iamActions: ["notifications:ListManagedNotificationChannelAssociations"],
    operation: notifications.listManagedNotificationChannelAssociations,
}));
//# sourceMappingURL=ListManagedNotificationChannelAssociationsHttp.js.map