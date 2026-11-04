import * as inspector2 from "@distilled.cloud/aws/inspector2";
import * as Layer from "effect/Layer";
import { makeInspector2AccountHttpBinding } from "./BindingHttp.js";
import { ListAccountPermissions } from "./ListAccountPermissions.js";
export const ListAccountPermissionsHttp = Layer.effect(ListAccountPermissions, makeInspector2AccountHttpBinding({
    tag: "AWS.Inspector2.ListAccountPermissions",
    operation: inspector2.listAccountPermissions,
    actions: ["inspector2:ListAccountPermissions"],
}));
//# sourceMappingURL=ListAccountPermissionsHttp.js.map