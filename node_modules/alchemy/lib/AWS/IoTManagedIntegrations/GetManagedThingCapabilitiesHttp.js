import * as mi from "@distilled.cloud/aws/iot-managed-integrations";
import * as Layer from "effect/Layer";
import { makeManagedThingHttpBinding } from "./BindingHttp.js";
import { GetManagedThingCapabilities } from "./GetManagedThingCapabilities.js";
export const GetManagedThingCapabilitiesHttp = Layer.effect(GetManagedThingCapabilities, makeManagedThingHttpBinding({
    capability: "GetManagedThingCapabilities",
    iamActions: ["iotmanagedintegrations:GetManagedThingCapabilities"],
    operation: mi.getManagedThingCapabilities,
    key: "Identifier",
}));
//# sourceMappingURL=GetManagedThingCapabilitiesHttp.js.map