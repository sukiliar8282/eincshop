import * as detective from "@distilled.cloud/aws/detective";
import * as Layer from "effect/Layer";
import { makeDetectiveAccountHttpBinding } from "./BindingHttp.js";
import { ListOrganizationAdminAccounts } from "./ListOrganizationAdminAccounts.js";
export const ListOrganizationAdminAccountsHttp = Layer.effect(ListOrganizationAdminAccounts, makeDetectiveAccountHttpBinding({
    tag: "AWS.Detective.ListOrganizationAdminAccounts",
    operation: detective.listOrganizationAdminAccounts,
    actions: ["detective:ListOrganizationAdminAccounts"],
}));
//# sourceMappingURL=ListOrganizationAdminAccountsHttp.js.map