import * as guardduty from "@distilled.cloud/aws/guardduty";
import * as Layer from "effect/Layer";
import { makeGuardDutyAccountHttpBinding } from "./BindingHttp.js";
import { ListOrganizationAdminAccounts } from "./ListOrganizationAdminAccounts.js";
export const ListOrganizationAdminAccountsHttp = Layer.effect(ListOrganizationAdminAccounts, makeGuardDutyAccountHttpBinding({
    tag: "AWS.GuardDuty.ListOrganizationAdminAccounts",
    operation: guardduty.listOrganizationAdminAccounts,
    actions: ["guardduty:ListOrganizationAdminAccounts"],
}));
//# sourceMappingURL=ListOrganizationAdminAccountsHttp.js.map