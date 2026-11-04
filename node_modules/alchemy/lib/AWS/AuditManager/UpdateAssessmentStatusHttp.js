import * as auditmanager from "@distilled.cloud/aws/auditmanager";
import * as Layer from "effect/Layer";
import { makeAssessmentScopedHttpBinding } from "./BindingHttp.js";
import { UpdateAssessmentStatus } from "./UpdateAssessmentStatus.js";
export const UpdateAssessmentStatusHttp = Layer.effect(UpdateAssessmentStatus, makeAssessmentScopedHttpBinding({
    tag: "AWS.AuditManager.UpdateAssessmentStatus",
    operation: auditmanager.updateAssessmentStatus,
    actions: ["auditmanager:UpdateAssessmentStatus"],
}));
//# sourceMappingURL=UpdateAssessmentStatusHttp.js.map