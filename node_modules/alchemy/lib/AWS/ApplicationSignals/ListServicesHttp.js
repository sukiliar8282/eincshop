import * as appsignals from "@distilled.cloud/aws/application-signals";
import * as Layer from "effect/Layer";
import { makeApplicationSignalsAccountHttpBinding } from "./BindingHttp.js";
import { ListServices } from "./ListServices.js";
export const ListServicesHttp = Layer.effect(ListServices, makeApplicationSignalsAccountHttpBinding({
    tag: "AWS.ApplicationSignals.ListServices",
    operation: appsignals.listServices,
    actions: ["application-signals:ListServices"],
}));
//# sourceMappingURL=ListServicesHttp.js.map