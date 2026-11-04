import * as mi from "@distilled.cloud/aws/iot-managed-integrations";
import * as Layer from "effect/Layer";
import { makeManagedIntegrationsHttpBinding } from "./BindingHttp.js";
import { ListDiscoveredDevices } from "./ListDiscoveredDevices.js";
export const ListDiscoveredDevicesHttp = Layer.effect(ListDiscoveredDevices, makeManagedIntegrationsHttpBinding({
    capability: "ListDiscoveredDevices",
    iamActions: ["iotmanagedintegrations:ListDiscoveredDevices"],
    operation: mi.listDiscoveredDevices,
}));
//# sourceMappingURL=ListDiscoveredDevicesHttp.js.map