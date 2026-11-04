import * as ram from "@distilled.cloud/aws/ram";
import * as Layer from "effect/Layer";
import { makeRAMHttpBinding } from "./BindingHttp.js";
import { ListPermissionVersions } from "./ListPermissionVersions.js";
export const ListPermissionVersionsHttp = Layer.effect(ListPermissionVersions, makeRAMHttpBinding({
    capability: "ListPermissionVersions",
    iamActions: ["ram:ListPermissionVersions"],
    operation: ram.listPermissionVersions,
}));
//# sourceMappingURL=ListPermissionVersionsHttp.js.map