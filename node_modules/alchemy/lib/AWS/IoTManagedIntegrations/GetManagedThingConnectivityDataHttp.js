import * as mi from "@distilled.cloud/aws/iot-managed-integrations";
import * as Layer from "effect/Layer";
import { makeManagedThingHttpBinding } from "./BindingHttp.js";
import { GetManagedThingConnectivityData } from "./GetManagedThingConnectivityData.js";
export const GetManagedThingConnectivityDataHttp = Layer.effect(GetManagedThingConnectivityData, makeManagedThingHttpBinding({
    capability: "GetManagedThingConnectivityData",
    iamActions: ["iotmanagedintegrations:GetManagedThingConnectivityData"],
    operation: mi.getManagedThingConnectivityData,
    key: "Identifier",
}));
//# sourceMappingURL=GetManagedThingConnectivityDataHttp.js.map