import * as appflow from "@distilled.cloud/aws/appflow";
import * as Layer from "effect/Layer";
import { makeAppFlowHttpBinding } from "./BindingHttp.js";
import { ListConnectorEntities } from "./ListConnectorEntities.js";
export const ListConnectorEntitiesHttp = Layer.effect(ListConnectorEntities, makeAppFlowHttpBinding({
    action: "ListConnectorEntities",
    operation: appflow.listConnectorEntities,
    identifier: (profile) => profile.connectorProfileName,
    requestKey: "connectorProfileName",
    resources: (profile) => [profile.connectorProfileArn],
}));
//# sourceMappingURL=ListConnectorEntitiesHttp.js.map