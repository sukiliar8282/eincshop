import * as auditmanager from "@distilled.cloud/aws/auditmanager";
import * as Layer from "effect/Layer";
import { makeAssessmentScopedHttpBinding } from "./BindingHttp.js";
import { GetAssessmentReportUrl } from "./GetAssessmentReportUrl.js";
export const GetAssessmentReportUrlHttp = Layer.effect(GetAssessmentReportUrl, makeAssessmentScopedHttpBinding({
    tag: "AWS.AuditManager.GetAssessmentReportUrl",
    operation: auditmanager.getAssessmentReportUrl,
    actions: ["auditmanager:GetAssessmentReportUrl"],
}));
//# sourceMappingURL=GetAssessmentReportUrlHttp.js.map