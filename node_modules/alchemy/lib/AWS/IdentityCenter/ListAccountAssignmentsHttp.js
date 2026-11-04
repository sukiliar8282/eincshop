import * as ssoAdmin from "@distilled.cloud/aws/sso-admin";
import * as Layer from "effect/Layer";
import { makeIdentityCenterInstanceHttpBinding } from "./BindingHttp.js";
import { ListAccountAssignments } from "./ListAccountAssignments.js";
export const ListAccountAssignmentsHttp = Layer.effect(ListAccountAssignments, makeIdentityCenterInstanceHttpBinding({
    tag: "AWS.IdentityCenter.ListAccountAssignments",
    operation: ssoAdmin.listAccountAssignments,
    actions: ["sso:ListAccountAssignments"],
}));
//# sourceMappingURL=ListAccountAssignmentsHttp.js.map