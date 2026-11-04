import * as auditmanager from "@distilled.cloud/aws/auditmanager";
import * as Layer from "effect/Layer";
import { makeAssessmentScopedHttpBinding } from "./BindingHttp.js";
import { GetInsightsByAssessment } from "./GetInsightsByAssessment.js";
export const GetInsightsByAssessmentHttp = Layer.effect(GetInsightsByAssessment, makeAssessmentScopedHttpBinding({
    tag: "AWS.AuditManager.GetInsightsByAssessment",
    operation: auditmanager.getInsightsByAssessment,
    actions: ["auditmanager:GetInsightsByAssessment"],
}));
//# sourceMappingURL=GetInsightsByAssessmentHttp.js.map