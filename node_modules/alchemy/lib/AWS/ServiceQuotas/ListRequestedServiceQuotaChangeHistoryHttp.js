import * as servicequotas from "@distilled.cloud/aws/service-quotas";
import * as Layer from "effect/Layer";
import { makeServiceQuotasHttpBinding } from "./BindingHttp.js";
import { ListRequestedServiceQuotaChangeHistory } from "./ListRequestedServiceQuotaChangeHistory.js";
export const ListRequestedServiceQuotaChangeHistoryHttp = Layer.effect(ListRequestedServiceQuotaChangeHistory, makeServiceQuotasHttpBinding({
    capability: "ListRequestedServiceQuotaChangeHistory",
    iamActions: ["servicequotas:ListRequestedServiceQuotaChangeHistory"],
    operation: servicequotas.listRequestedServiceQuotaChangeHistory,
}));
//# sourceMappingURL=ListRequestedServiceQuotaChangeHistoryHttp.js.map