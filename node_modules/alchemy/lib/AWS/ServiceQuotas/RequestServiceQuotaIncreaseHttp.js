import * as servicequotas from "@distilled.cloud/aws/service-quotas";
import * as Layer from "effect/Layer";
import { makeServiceQuotasHttpBinding } from "./BindingHttp.js";
import { RequestServiceQuotaIncrease } from "./RequestServiceQuotaIncrease.js";
export const RequestServiceQuotaIncreaseHttp = Layer.effect(RequestServiceQuotaIncrease, makeServiceQuotasHttpBinding({
    capability: "RequestServiceQuotaIncrease",
    iamActions: ["servicequotas:RequestServiceQuotaIncrease"],
    operation: servicequotas.requestServiceQuotaIncrease,
}));
//# sourceMappingURL=RequestServiceQuotaIncreaseHttp.js.map