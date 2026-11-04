import * as auditmanager from "@distilled.cloud/aws/auditmanager";
import * as Layer from "effect/Layer";
import { makeAssessmentScopedHttpBinding } from "./BindingHttp.js";
import { GetChangeLogs } from "./GetChangeLogs.js";
export const GetChangeLogsHttp = Layer.effect(GetChangeLogs, makeAssessmentScopedHttpBinding({
    tag: "AWS.AuditManager.GetChangeLogs",
    operation: auditmanager.getChangeLogs,
    actions: ["auditmanager:GetChangeLogs"],
}));
//# sourceMappingURL=GetChangeLogsHttp.js.map