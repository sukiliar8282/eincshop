import * as mi from "@distilled.cloud/aws/iot-managed-integrations";
import * as Layer from "effect/Layer";
import { makeManagedThingHttpBinding } from "./BindingHttp.js";
import { GetManagedThingMetaData } from "./GetManagedThingMetaData.js";
export const GetManagedThingMetaDataHttp = Layer.effect(GetManagedThingMetaData, makeManagedThingHttpBinding({
    capability: "GetManagedThingMetaData",
    iamActions: ["iotmanagedintegrations:GetManagedThingMetaData"],
    operation: mi.getManagedThingMetaData,
    key: "Identifier",
}));
//# sourceMappingURL=GetManagedThingMetaDataHttp.js.map