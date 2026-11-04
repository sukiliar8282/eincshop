import * as auditmanager from "@distilled.cloud/aws/auditmanager";
import * as Layer from "effect/Layer";
import { makeAuditManagerAccountHttpBinding } from "./BindingHttp.js";
import { GetDelegations } from "./GetDelegations.js";
export const GetDelegationsHttp = Layer.effect(GetDelegations, makeAuditManagerAccountHttpBinding({
    tag: "AWS.AuditManager.GetDelegations",
    operation: auditmanager.getDelegations,
    actions: ["auditmanager:GetDelegations"],
}));
//# sourceMappingURL=GetDelegationsHttp.js.map