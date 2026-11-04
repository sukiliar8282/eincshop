import * as ssoAdmin from "@distilled.cloud/aws/sso-admin";
import * as Layer from "effect/Layer";
import { makeIdentityCenterInstanceHttpBinding } from "./BindingHttp.js";
import { ListAccountAssignmentsForPrincipal } from "./ListAccountAssignmentsForPrincipal.js";
export const ListAccountAssignmentsForPrincipalHttp = Layer.effect(ListAccountAssignmentsForPrincipal, makeIdentityCenterInstanceHttpBinding({
    tag: "AWS.IdentityCenter.ListAccountAssignmentsForPrincipal",
    operation: ssoAdmin.listAccountAssignmentsForPrincipal,
    actions: ["sso:ListAccountAssignmentsForPrincipal"],
}));
//# sourceMappingURL=ListAccountAssignmentsForPrincipalHttp.js.map