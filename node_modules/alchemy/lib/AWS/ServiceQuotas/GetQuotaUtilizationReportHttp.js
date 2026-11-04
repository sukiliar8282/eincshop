import * as servicequotas from "@distilled.cloud/aws/service-quotas";
import * as Layer from "effect/Layer";
import { makeServiceQuotasHttpBinding } from "./BindingHttp.js";
import { GetQuotaUtilizationReport } from "./GetQuotaUtilizationReport.js";
export const GetQuotaUtilizationReportHttp = Layer.effect(GetQuotaUtilizationReport, makeServiceQuotasHttpBinding({
    capability: "GetQuotaUtilizationReport",
    iamActions: ["servicequotas:GetQuotaUtilizationReport"],
    operation: servicequotas.getQuotaUtilizationReport,
}));
//# sourceMappingURL=GetQuotaUtilizationReportHttp.js.map