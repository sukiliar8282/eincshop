import * as servicequotas from "@distilled.cloud/aws/service-quotas";
import * as Layer from "effect/Layer";
import { makeServiceQuotasHttpBinding } from "./BindingHttp.js";
import { StartQuotaUtilizationReport } from "./StartQuotaUtilizationReport.js";
export const StartQuotaUtilizationReportHttp = Layer.effect(StartQuotaUtilizationReport, makeServiceQuotasHttpBinding({
    capability: "StartQuotaUtilizationReport",
    iamActions: ["servicequotas:StartQuotaUtilizationReport"],
    operation: servicequotas.startQuotaUtilizationReport,
}));
//# sourceMappingURL=StartQuotaUtilizationReportHttp.js.map