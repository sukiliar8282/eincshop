import * as auditmanager from "@distilled.cloud/aws/auditmanager";
import * as Layer from "effect/Layer";
import { makeAssessmentScopedHttpBinding } from "./BindingHttp.js";
import { DisassociateAssessmentReportEvidenceFolder } from "./DisassociateAssessmentReportEvidenceFolder.js";
export const DisassociateAssessmentReportEvidenceFolderHttp = Layer.effect(DisassociateAssessmentReportEvidenceFolder, makeAssessmentScopedHttpBinding({
    tag: "AWS.AuditManager.DisassociateAssessmentReportEvidenceFolder",
    operation: auditmanager.disassociateAssessmentReportEvidenceFolder,
    actions: ["auditmanager:DisassociateAssessmentReportEvidenceFolder"],
}));
//# sourceMappingURL=DisassociateAssessmentReportEvidenceFolderHttp.js.map