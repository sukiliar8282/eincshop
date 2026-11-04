import * as ssoAdmin from "@distilled.cloud/aws/sso-admin";
import * as Layer from "effect/Layer";
import { makeIdentityCenterInstanceHttpBinding } from "./BindingHttp.js";
import { ListPermissionSets } from "./ListPermissionSets.js";
export const ListPermissionSetsHttp = Layer.effect(ListPermissionSets, makeIdentityCenterInstanceHttpBinding({
    tag: "AWS.IdentityCenter.ListPermissionSets",
    operation: ssoAdmin.listPermissionSets,
    actions: ["sso:ListPermissionSets"],
}));
//# sourceMappingURL=ListPermissionSetsHttp.js.map