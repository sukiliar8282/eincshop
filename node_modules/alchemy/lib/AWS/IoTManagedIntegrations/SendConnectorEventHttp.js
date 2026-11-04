import * as mi from "@distilled.cloud/aws/iot-managed-integrations";
import * as Layer from "effect/Layer";
import { makeManagedIntegrationsHttpBinding } from "./BindingHttp.js";
import { SendConnectorEvent } from "./SendConnectorEvent.js";
export const SendConnectorEventHttp = Layer.effect(SendConnectorEvent, makeManagedIntegrationsHttpBinding({
    capability: "SendConnectorEvent",
    iamActions: ["iotmanagedintegrations:SendConnectorEvent"],
    operation: mi.sendConnectorEvent,
}));
//# sourceMappingURL=SendConnectorEventHttp.js.map