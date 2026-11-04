import * as servicequotas from "@distilled.cloud/aws/service-quotas";
import * as Layer from "effect/Layer";
import { makeServiceQuotasHttpBinding } from "./BindingHttp.js";
import { ListRequestedServiceQuotaChangeHistoryByQuota } from "./ListRequestedServiceQuotaChangeHistoryByQuota.js";
export const ListRequestedServiceQuotaChangeHistoryByQuotaHttp = Layer.effect(ListRequestedServiceQuotaChangeHistoryByQuota, makeServiceQuotasHttpBinding({
    capability: "ListRequestedServiceQuotaChangeHistoryByQuota",
    iamActions: ["servicequotas:ListRequestedServiceQuotaChangeHistoryByQuota"],
    operation: servicequotas.listRequestedServiceQuotaChangeHistoryByQuota,
}));
//# sourceMappingURL=ListRequestedServiceQuotaChangeHistoryByQuotaHttp.js.map