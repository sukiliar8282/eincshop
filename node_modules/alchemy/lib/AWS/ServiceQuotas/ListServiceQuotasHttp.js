import * as servicequotas from "@distilled.cloud/aws/service-quotas";
import * as Layer from "effect/Layer";
import { makeServiceQuotasHttpBinding } from "./BindingHttp.js";
import { ListServiceQuotas } from "./ListServiceQuotas.js";
export const ListServiceQuotasHttp = Layer.effect(ListServiceQuotas, makeServiceQuotasHttpBinding({
    capability: "ListServiceQuotas",
    iamActions: ["servicequotas:ListServiceQuotas"],
    operation: servicequotas.listServiceQuotas,
}));
//# sourceMappingURL=ListServiceQuotasHttp.js.map