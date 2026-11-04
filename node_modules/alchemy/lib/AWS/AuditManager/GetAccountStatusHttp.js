import * as auditmanager from "@distilled.cloud/aws/auditmanager";
import * as Layer from "effect/Layer";
import { makeAuditManagerAccountHttpBinding } from "./BindingHttp.js";
import { GetAccountStatus } from "./GetAccountStatus.js";
export const GetAccountStatusHttp = Layer.effect(GetAccountStatus, makeAuditManagerAccountHttpBinding({
    tag: "AWS.AuditManager.GetAccountStatus",
    operation: auditmanager.getAccountStatus,
    actions: ["auditmanager:GetAccountStatus"],
}));
//# sourceMappingURL=GetAccountStatusHttp.js.map