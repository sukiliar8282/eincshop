import * as auditmanager from "@distilled.cloud/aws/auditmanager";
import * as Layer from "effect/Layer";
import { makeAssessmentScopedHttpBinding } from "./BindingHttp.js";
import { GetEvidenceFoldersByAssessment } from "./GetEvidenceFoldersByAssessment.js";
export const GetEvidenceFoldersByAssessmentHttp = Layer.effect(GetEvidenceFoldersByAssessment, makeAssessmentScopedHttpBinding({
    tag: "AWS.AuditManager.GetEvidenceFoldersByAssessment",
    operation: auditmanager.getEvidenceFoldersByAssessment,
    actions: ["auditmanager:GetEvidenceFoldersByAssessment"],
}));
//# sourceMappingURL=GetEvidenceFoldersByAssessmentHttp.js.map