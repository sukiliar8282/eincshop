import * as mi from "@distilled.cloud/aws/iot-managed-integrations";
import * as Layer from "effect/Layer";
import { makeManagedIntegrationsHttpBinding } from "./BindingHttp.js";
import { ListSchemaVersions } from "./ListSchemaVersions.js";
export const ListSchemaVersionsHttp = Layer.effect(ListSchemaVersions, makeManagedIntegrationsHttpBinding({
    capability: "ListSchemaVersions",
    iamActions: ["iotmanagedintegrations:ListSchemaVersions"],
    operation: mi.listSchemaVersions,
}));
//# sourceMappingURL=ListSchemaVersionsHttp.js.map