import * as datazone from "@distilled.cloud/aws/datazone";
import * as Layer from "effect/Layer";
import { makeDataZoneDomainHttpBinding } from "./BindingHttp.js";
import { ListNotifications } from "./ListNotifications.js";
export const ListNotificationsHttp = Layer.effect(ListNotifications, makeDataZoneDomainHttpBinding({
    tag: "AWS.DataZone.ListNotifications",
    operation: datazone.listNotifications,
    actions: ["datazone:ListNotifications"],
}));
//# sourceMappingURL=ListNotificationsHttp.js.map