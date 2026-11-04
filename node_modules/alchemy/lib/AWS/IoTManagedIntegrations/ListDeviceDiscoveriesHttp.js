import * as mi from "@distilled.cloud/aws/iot-managed-integrations";
import * as Layer from "effect/Layer";
import { makeManagedIntegrationsHttpBinding } from "./BindingHttp.js";
import { ListDeviceDiscoveries } from "./ListDeviceDiscoveries.js";
export const ListDeviceDiscoveriesHttp = Layer.effect(ListDeviceDiscoveries, makeManagedIntegrationsHttpBinding({
    capability: "ListDeviceDiscoveries",
    iamActions: ["iotmanagedintegrations:ListDeviceDiscoveries"],
    operation: mi.listDeviceDiscoveries,
}));
//# sourceMappingURL=ListDeviceDiscoveriesHttp.js.map