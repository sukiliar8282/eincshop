import * as auditmanager from "@distilled.cloud/aws/auditmanager";
import * as Layer from "effect/Layer";
import { makeAuditManagerAccountHttpBinding } from "./BindingHttp.js";
import { ListControlDomainInsights } from "./ListControlDomainInsights.js";
export const ListControlDomainInsightsHttp = Layer.effect(ListControlDomainInsights, makeAuditManagerAccountHttpBinding({
    tag: "AWS.AuditManager.ListControlDomainInsights",
    operation: auditmanager.listControlDomainInsights,
    actions: ["auditmanager:ListControlDomainInsights"],
}));
//# sourceMappingURL=ListControlDomainInsightsHttp.js.map