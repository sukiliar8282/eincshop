import * as auditmanager from "@distilled.cloud/aws/auditmanager";
import * as Layer from "effect/Layer";
import { makeAuditManagerAccountHttpBinding } from "./BindingHttp.js";
import { ListControlInsightsByControlDomain } from "./ListControlInsightsByControlDomain.js";
export const ListControlInsightsByControlDomainHttp = Layer.effect(ListControlInsightsByControlDomain, makeAuditManagerAccountHttpBinding({
    tag: "AWS.AuditManager.ListControlInsightsByControlDomain",
    operation: auditmanager.listControlInsightsByControlDomain,
    actions: ["auditmanager:ListControlInsightsByControlDomain"],
}));
//# sourceMappingURL=ListControlInsightsByControlDomainHttp.js.map