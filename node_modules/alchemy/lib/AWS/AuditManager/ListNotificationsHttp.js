import * as auditmanager from "@distilled.cloud/aws/auditmanager";
import * as Layer from "effect/Layer";
import { makeAuditManagerAccountHttpBinding } from "./BindingHttp.js";
import { ListNotifications } from "./ListNotifications.js";
export const ListNotificationsHttp = Layer.effect(ListNotifications, makeAuditManagerAccountHttpBinding({
    tag: "AWS.AuditManager.ListNotifications",
    operation: auditmanager.listNotifications,
    actions: ["auditmanager:ListNotifications"],
}));
//# sourceMappingURL=ListNotificationsHttp.js.map