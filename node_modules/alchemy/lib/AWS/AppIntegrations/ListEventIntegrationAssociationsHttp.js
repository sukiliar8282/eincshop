import * as appintegrations from "@distilled.cloud/aws/appintegrations";
import * as Layer from "effect/Layer";
import * as Output from "../../Output.js";
import { makeAppIntegrationsHttpBinding } from "./BindingHttp.js";
import { ListEventIntegrationAssociations } from "./ListEventIntegrationAssociations.js";
/**
 * HTTP implementation of {@link ListEventIntegrationAssociations}. At deploy
 * time it grants `app-integrations:ListEventIntegrationAssociations` on the
 * event integration (and its `event-integration-association/*` children); at
 * runtime it calls the AppIntegrations API with the host Function's
 * credentials, injecting the event integration's name. Provide this layer on
 * the Function using the binding.
 */
export const ListEventIntegrationAssociationsHttp = Layer.effect(ListEventIntegrationAssociations, makeAppIntegrationsHttpBinding({
    name: "ListEventIntegrationAssociations",
    operation: appintegrations.listEventIntegrationAssociations,
    requestKey: "EventIntegrationName",
    identifier: (integration) => integration.eventIntegrationName,
    iamActions: ["app-integrations:ListEventIntegrationAssociations"],
    resources: (integration, { region, accountId }) => [
        Output.interpolate `${integration.eventIntegrationArn}`,
        Output.interpolate `arn:aws:app-integrations:${region}:${accountId}:event-integration-association/${integration.eventIntegrationName}/*`,
    ],
}));
//# sourceMappingURL=ListEventIntegrationAssociationsHttp.js.map