import * as appsignals from "@distilled.cloud/aws/application-signals";
import * as Layer from "effect/Layer";
import { makeApplicationSignalsAccountHttpBinding } from "./BindingHttp.js";
import { ListServiceDependencies } from "./ListServiceDependencies.js";
export const ListServiceDependenciesHttp = Layer.effect(ListServiceDependencies, makeApplicationSignalsAccountHttpBinding({
    tag: "AWS.ApplicationSignals.ListServiceDependencies",
    operation: appsignals.listServiceDependencies,
    actions: ["application-signals:ListServiceDependencies"],
}));
//# sourceMappingURL=ListServiceDependenciesHttp.js.map