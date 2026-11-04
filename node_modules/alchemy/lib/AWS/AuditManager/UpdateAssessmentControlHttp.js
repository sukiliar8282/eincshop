import * as auditmanager from "@distilled.cloud/aws/auditmanager";
import * as Layer from "effect/Layer";
import { makeAssessmentScopedHttpBinding } from "./BindingHttp.js";
import { UpdateAssessmentControl } from "./UpdateAssessmentControl.js";
export const UpdateAssessmentControlHttp = Layer.effect(UpdateAssessmentControl, makeAssessmentScopedHttpBinding({
    tag: "AWS.AuditManager.UpdateAssessmentControl",
    operation: auditmanager.updateAssessmentControl,
    actions: ["auditmanager:UpdateAssessmentControl"],
}));
//# sourceMappingURL=UpdateAssessmentControlHttp.js.map