import * as appintegrations from "@distilled.cloud/aws/appintegrations";
import * as Layer from "effect/Layer";
import * as Output from "../../Output.js";
import { makeAppIntegrationsHttpBinding } from "./BindingHttp.js";
import { ListDataIntegrationAssociations } from "./ListDataIntegrationAssociations.js";
/**
 * HTTP implementation of {@link ListDataIntegrationAssociations}. At deploy
 * time it grants `app-integrations:ListDataIntegrationAssociations` on the
 * data integration (and its `data-integration-association/*` children); at
 * runtime it calls the AppIntegrations API with the host Function's
 * credentials, injecting the data integration's id. Provide this layer on
 * the Function using the binding.
 */
export const ListDataIntegrationAssociationsHttp = Layer.effect(ListDataIntegrationAssociations, makeAppIntegrationsHttpBinding({
    name: "ListDataIntegrationAssociations",
    operation: appintegrations.listDataIntegrationAssociations,
    requestKey: "DataIntegrationIdentifier",
    identifier: (integration) => integration.dataIntegrationId,
    iamActions: ["app-integrations:ListDataIntegrationAssociations"],
    resources: (integration, { region, accountId }) => [
        Output.interpolate `${integration.dataIntegrationArn}`,
        Output.interpolate `arn:aws:app-integrations:${region}:${accountId}:data-integration-association/${integration.dataIntegrationId}/*`,
    ],
}));
//# sourceMappingURL=ListDataIntegrationAssociationsHttp.js.map