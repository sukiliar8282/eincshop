import * as auditmanager from "@distilled.cloud/aws/auditmanager";
import * as Layer from "effect/Layer";
import { makeAuditManagerAccountHttpBinding } from "./BindingHttp.js";
import { ListAssessmentReports } from "./ListAssessmentReports.js";
export const ListAssessmentReportsHttp = Layer.effect(ListAssessmentReports, makeAuditManagerAccountHttpBinding({
    tag: "AWS.AuditManager.ListAssessmentReports",
    operation: auditmanager.listAssessmentReports,
    actions: ["auditmanager:ListAssessmentReports"],
}));
//# sourceMappingURL=ListAssessmentReportsHttp.js.map