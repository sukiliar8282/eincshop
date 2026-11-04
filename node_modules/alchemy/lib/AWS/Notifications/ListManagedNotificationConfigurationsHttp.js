import * as notifications from "@distilled.cloud/aws/notifications";
import * as Layer from "effect/Layer";
import { makeNotificationsHttpBinding } from "./BindingHttp.js";
import { ListManagedNotificationConfigurations } from "./ListManagedNotificationConfigurations.js";
export const ListManagedNotificationConfigurationsHttp = Layer.effect(ListManagedNotificationConfigurations, makeNotificationsHttpBinding({
    capability: "ListManagedNotificationConfigurations",
    iamActions: ["notifications:ListManagedNotificationConfigurations"],
    operation: notifications.listManagedNotificationConfigurations,
}));
//# sourceMappingURL=ListManagedNotificationConfigurationsHttp.js.map