import * as auditmanager from "@distilled.cloud/aws/auditmanager";
import * as Layer from "effect/Layer";
import { makeAssessmentScopedHttpBinding } from "./BindingHttp.js";
import { ListAssessmentControlInsightsByControlDomain } from "./ListAssessmentControlInsightsByControlDomain.js";
export const ListAssessmentControlInsightsByControlDomainHttp = Layer.effect(ListAssessmentControlInsightsByControlDomain, makeAssessmentScopedHttpBinding({
    tag: "AWS.AuditManager.ListAssessmentControlInsightsByControlDomain",
    operation: auditmanager.listAssessmentControlInsightsByControlDomain,
    actions: ["auditmanager:ListAssessmentControlInsightsByControlDomain"],
}));
//# sourceMappingURL=ListAssessmentControlInsightsByControlDomainHttp.js.map