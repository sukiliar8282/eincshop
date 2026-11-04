import * as auditmanager from "@distilled.cloud/aws/auditmanager";
import * as Layer from "effect/Layer";
import { makeAssessmentScopedHttpBinding } from "./BindingHttp.js";
import { ListControlDomainInsightsByAssessment } from "./ListControlDomainInsightsByAssessment.js";
export const ListControlDomainInsightsByAssessmentHttp = Layer.effect(ListControlDomainInsightsByAssessment, makeAssessmentScopedHttpBinding({
    tag: "AWS.AuditManager.ListControlDomainInsightsByAssessment",
    operation: auditmanager.listControlDomainInsightsByAssessment,
    actions: ["auditmanager:ListControlDomainInsightsByAssessment"],
}));
//# sourceMappingURL=ListControlDomainInsightsByAssessmentHttp.js.map