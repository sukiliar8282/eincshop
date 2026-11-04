import * as servicequotas from "@distilled.cloud/aws/service-quotas";
import * as Layer from "effect/Layer";
import { makeServiceQuotasHttpBinding } from "./BindingHttp.js";
import { GetServiceQuota } from "./GetServiceQuota.js";
export const GetServiceQuotaHttp = Layer.effect(GetServiceQuota, makeServiceQuotasHttpBinding({
    capability: "GetServiceQuota",
    iamActions: ["servicequotas:GetServiceQuota"],
    operation: servicequotas.getServiceQuota,
}));
//# sourceMappingURL=GetServiceQuotaHttp.js.map