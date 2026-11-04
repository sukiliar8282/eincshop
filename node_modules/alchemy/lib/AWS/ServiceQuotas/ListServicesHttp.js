import * as servicequotas from "@distilled.cloud/aws/service-quotas";
import * as Layer from "effect/Layer";
import { makeServiceQuotasHttpBinding } from "./BindingHttp.js";
import { ListServices } from "./ListServices.js";
export const ListServicesHttp = Layer.effect(ListServices, makeServiceQuotasHttpBinding({
    capability: "ListServices",
    iamActions: ["servicequotas:ListServices"],
    operation: servicequotas.listServices,
}));
//# sourceMappingURL=ListServicesHttp.js.map