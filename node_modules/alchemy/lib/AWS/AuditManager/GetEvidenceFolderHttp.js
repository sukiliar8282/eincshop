import * as auditmanager from "@distilled.cloud/aws/auditmanager";
import * as Layer from "effect/Layer";
import { makeAssessmentScopedHttpBinding } from "./BindingHttp.js";
import { GetEvidenceFolder } from "./GetEvidenceFolder.js";
export const GetEvidenceFolderHttp = Layer.effect(GetEvidenceFolder, makeAssessmentScopedHttpBinding({
    tag: "AWS.AuditManager.GetEvidenceFolder",
    operation: auditmanager.getEvidenceFolder,
    actions: ["auditmanager:GetEvidenceFolder"],
}));
//# sourceMappingURL=GetEvidenceFolderHttp.js.map