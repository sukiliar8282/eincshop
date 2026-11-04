import * as auditmanager from "@distilled.cloud/aws/auditmanager";
import * as Layer from "effect/Layer";
import { makeAssessmentScopedHttpBinding } from "./BindingHttp.js";
import { GetEvidenceFoldersByAssessmentControl } from "./GetEvidenceFoldersByAssessmentControl.js";
export const GetEvidenceFoldersByAssessmentControlHttp = Layer.effect(GetEvidenceFoldersByAssessmentControl, makeAssessmentScopedHttpBinding({
    tag: "AWS.AuditManager.GetEvidenceFoldersByAssessmentControl",
    operation: auditmanager.getEvidenceFoldersByAssessmentControl,
    actions: ["auditmanager:GetEvidenceFoldersByAssessmentControl"],
}));
//# sourceMappingURL=GetEvidenceFoldersByAssessmentControlHttp.js.map