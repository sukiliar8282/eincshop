import * as appsignals from "@distilled.cloud/aws/application-signals";
import * as Layer from "effect/Layer";
import { makeApplicationSignalsAccountHttpBinding } from "./BindingHttp.js";
import { ListAuditFindings } from "./ListAuditFindings.js";
export const ListAuditFindingsHttp = Layer.effect(ListAuditFindings, makeApplicationSignalsAccountHttpBinding({
    tag: "AWS.ApplicationSignals.ListAuditFindings",
    operation: appsignals.listAuditFindings,
    // The auditors run with the CALLER's credentials — verified live: a
    // service-target audit fails with AccessDeniedException (empty message)
    // unless the caller can also enumerate SLOs and read metric data.
    // Deeper detail levels (trace/log auditors) may need further read
    // permissions (xray/logs).
    actions: [
        "application-signals:ListAuditFindings",
        "application-signals:ListServiceLevelObjectives",
        "cloudwatch:GetMetricData",
    ],
}));
//# sourceMappingURL=ListAuditFindingsHttp.js.map