import * as appintegrations from "@distilled.cloud/aws/appintegrations";
import * as Layer from "effect/Layer";
import { makeAppIntegrationsAccountHttpBinding } from "./BindingHttp.js";
import { ListEventIntegrations } from "./ListEventIntegrations.js";
/**
 * HTTP implementation of {@link ListEventIntegrations}. At deploy time it
 * grants `app-integrations:ListEventIntegrations`; at runtime it calls the
 * AppIntegrations API with the host Function's credentials. Provide this
 * layer on the Function using the binding.
 */
export const ListEventIntegrationsHttp = Layer.effect(ListEventIntegrations, makeAppIntegrationsAccountHttpBinding({
    name: "ListEventIntegrations",
    operation: appintegrations.listEventIntegrations,
    iamActions: ["app-integrations:ListEventIntegrations"],
}));
//# sourceMappingURL=ListEventIntegrationsHttp.js.map