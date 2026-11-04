import * as servicequotas from "@distilled.cloud/aws/service-quotas";
import * as Layer from "effect/Layer";
import { makeServiceQuotasHttpBinding } from "./BindingHttp.js";
import { ListAWSDefaultServiceQuotas } from "./ListAWSDefaultServiceQuotas.js";
export const ListAWSDefaultServiceQuotasHttp = Layer.effect(ListAWSDefaultServiceQuotas, makeServiceQuotasHttpBinding({
    capability: "ListAWSDefaultServiceQuotas",
    iamActions: ["servicequotas:ListAWSDefaultServiceQuotas"],
    operation: servicequotas.listAWSDefaultServiceQuotas,
}));
//# sourceMappingURL=ListAWSDefaultServiceQuotasHttp.js.map