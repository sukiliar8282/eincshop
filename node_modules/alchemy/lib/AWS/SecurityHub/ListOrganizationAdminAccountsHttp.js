import * as securityhub from "@distilled.cloud/aws/securityhub";
import * as Layer from "effect/Layer";
import { makeSecurityHubHttpBinding } from "./BindingHttp.js";
import { ListOrganizationAdminAccounts } from "./ListOrganizationAdminAccounts.js";
export const ListOrganizationAdminAccountsHttp = Layer.effect(ListOrganizationAdminAccounts, makeSecurityHubHttpBinding({
    tag: "AWS.SecurityHub.ListOrganizationAdminAccounts",
    operation: securityhub.listOrganizationAdminAccounts,
    actions: ["securityhub:ListOrganizationAdminAccounts"],
}));
//# sourceMappingURL=ListOrganizationAdminAccountsHttp.js.map