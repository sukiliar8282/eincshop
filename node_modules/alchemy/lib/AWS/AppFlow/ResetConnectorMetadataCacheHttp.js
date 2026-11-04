import * as appflow from "@distilled.cloud/aws/appflow";
import * as Layer from "effect/Layer";
import { makeAppFlowHttpBinding } from "./BindingHttp.js";
import { ResetConnectorMetadataCache } from "./ResetConnectorMetadataCache.js";
export const ResetConnectorMetadataCacheHttp = Layer.effect(ResetConnectorMetadataCache, makeAppFlowHttpBinding({
    action: "ResetConnectorMetadataCache",
    operation: appflow.resetConnectorMetadataCache,
    identifier: (profile) => profile.connectorProfileName,
    requestKey: "connectorProfileName",
    resources: (profile) => [profile.connectorProfileArn],
}));
//# sourceMappingURL=ResetConnectorMetadataCacheHttp.js.map