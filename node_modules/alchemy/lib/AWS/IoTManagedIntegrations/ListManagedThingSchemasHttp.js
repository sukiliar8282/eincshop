import * as mi from "@distilled.cloud/aws/iot-managed-integrations";
import * as Layer from "effect/Layer";
import { makeManagedThingHttpBinding } from "./BindingHttp.js";
import { ListManagedThingSchemas } from "./ListManagedThingSchemas.js";
export const ListManagedThingSchemasHttp = Layer.effect(ListManagedThingSchemas, makeManagedThingHttpBinding({
    capability: "ListManagedThingSchemas",
    iamActions: ["iotmanagedintegrations:ListManagedThingSchemas"],
    operation: mi.listManagedThingSchemas,
    key: "Identifier",
}));
//# sourceMappingURL=ListManagedThingSchemasHttp.js.map