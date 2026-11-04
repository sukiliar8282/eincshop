import * as ram from "@distilled.cloud/aws/ram";
import * as Layer from "effect/Layer";
import { makeRAMHttpBinding } from "./BindingHttp.js";
import { ListPermissions } from "./ListPermissions.js";
export const ListPermissionsHttp = Layer.effect(ListPermissions, makeRAMHttpBinding({
    capability: "ListPermissions",
    iamActions: ["ram:ListPermissions"],
    operation: ram.listPermissions,
}));
//# sourceMappingURL=ListPermissionsHttp.js.map