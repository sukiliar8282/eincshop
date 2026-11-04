import * as mi from "@distilled.cloud/aws/iot-managed-integrations";
import * as Layer from "effect/Layer";
import { makeManagedIntegrationsHttpBinding } from "./BindingHttp.js";
import { GetDeviceDiscovery } from "./GetDeviceDiscovery.js";
export const GetDeviceDiscoveryHttp = Layer.effect(GetDeviceDiscovery, makeManagedIntegrationsHttpBinding({
    capability: "GetDeviceDiscovery",
    iamActions: ["iotmanagedintegrations:GetDeviceDiscovery"],
    operation: mi.getDeviceDiscovery,
}));
//# sourceMappingURL=GetDeviceDiscoveryHttp.js.map