import * as auditmanager from "@distilled.cloud/aws/auditmanager";
import * as Layer from "effect/Layer";
import { makeAuditManagerAccountHttpBinding } from "./BindingHttp.js";
import { GetServicesInScope } from "./GetServicesInScope.js";
export const GetServicesInScopeHttp = Layer.effect(GetServicesInScope, makeAuditManagerAccountHttpBinding({
    tag: "AWS.AuditManager.GetServicesInScope",
    operation: auditmanager.getServicesInScope,
    actions: ["auditmanager:GetServicesInScope"],
}));
//# sourceMappingURL=GetServicesInScopeHttp.js.map