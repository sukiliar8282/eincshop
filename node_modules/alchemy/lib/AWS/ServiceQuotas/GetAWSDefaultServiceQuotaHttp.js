import * as servicequotas from "@distilled.cloud/aws/service-quotas";
import * as Layer from "effect/Layer";
import { makeServiceQuotasHttpBinding } from "./BindingHttp.js";
import { GetAWSDefaultServiceQuota } from "./GetAWSDefaultServiceQuota.js";
export const GetAWSDefaultServiceQuotaHttp = Layer.effect(GetAWSDefaultServiceQuota, makeServiceQuotasHttpBinding({
    capability: "GetAWSDefaultServiceQuota",
    iamActions: ["servicequotas:GetAWSDefaultServiceQuota"],
    operation: servicequotas.getAWSDefaultServiceQuota,
}));
//# sourceMappingURL=GetAWSDefaultServiceQuotaHttp.js.map