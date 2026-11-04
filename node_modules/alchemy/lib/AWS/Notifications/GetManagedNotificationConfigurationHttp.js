import * as notifications from "@distilled.cloud/aws/notifications";
import * as Layer from "effect/Layer";
import { makeNotificationsHttpBinding } from "./BindingHttp.js";
import { GetManagedNotificationConfiguration } from "./GetManagedNotificationConfiguration.js";
export const GetManagedNotificationConfigurationHttp = Layer.effect(GetManagedNotificationConfiguration, makeNotificationsHttpBinding({
    capability: "GetManagedNotificationConfiguration",
    iamActions: ["notifications:GetManagedNotificationConfiguration"],
    operation: notifications.getManagedNotificationConfiguration,
}));
//# sourceMappingURL=GetManagedNotificationConfigurationHttp.js.map