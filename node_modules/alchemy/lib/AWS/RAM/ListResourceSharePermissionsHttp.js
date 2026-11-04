import * as ram from "@distilled.cloud/aws/ram";
import * as Layer from "effect/Layer";
import { makeRAMHttpBinding } from "./BindingHttp.js";
import { ListResourceSharePermissions } from "./ListResourceSharePermissions.js";
export const ListResourceSharePermissionsHttp = Layer.effect(ListResourceSharePermissions, makeRAMHttpBinding({
    capability: "ListResourceSharePermissions",
    iamActions: ["ram:ListResourceSharePermissions"],
    operation: ram.listResourceSharePermissions,
}));
//# sourceMappingURL=ListResourceSharePermissionsHttp.js.map