import * as mi from "@distilled.cloud/aws/iot-managed-integrations";
import * as Layer from "effect/Layer";
import { makeManagedIntegrationsHttpBinding } from "./BindingHttp.js";
import { GetSchemaVersion } from "./GetSchemaVersion.js";
export const GetSchemaVersionHttp = Layer.effect(GetSchemaVersion, makeManagedIntegrationsHttpBinding({
    capability: "GetSchemaVersion",
    iamActions: ["iotmanagedintegrations:GetSchemaVersion"],
    operation: mi.getSchemaVersion,
}));
//# sourceMappingURL=GetSchemaVersionHttp.js.map