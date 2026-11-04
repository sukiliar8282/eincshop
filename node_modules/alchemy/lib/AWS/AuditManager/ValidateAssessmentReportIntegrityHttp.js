import * as auditmanager from "@distilled.cloud/aws/auditmanager";
import * as Layer from "effect/Layer";
import { makeAuditManagerAccountHttpBinding } from "./BindingHttp.js";
import { ValidateAssessmentReportIntegrity } from "./ValidateAssessmentReportIntegrity.js";
export const ValidateAssessmentReportIntegrityHttp = Layer.effect(ValidateAssessmentReportIntegrity, makeAuditManagerAccountHttpBinding({
    tag: "AWS.AuditManager.ValidateAssessmentReportIntegrity",
    operation: auditmanager.validateAssessmentReportIntegrity,
    actions: ["auditmanager:ValidateAssessmentReportIntegrity"],
}));
//# sourceMappingURL=ValidateAssessmentReportIntegrityHttp.js.map