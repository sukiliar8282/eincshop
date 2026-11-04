import * as guardduty from "@distilled.cloud/aws/guardduty";
import * as Layer from "effect/Layer";
import { makeGuardDutyAccountHttpBinding } from "./BindingHttp.js";
import { DisableOrganizationAdminAccount } from "./DisableOrganizationAdminAccount.js";
export const DisableOrganizationAdminAccountHttp = Layer.effect(DisableOrganizationAdminAccount, makeGuardDutyAccountHttpBinding({
    tag: "AWS.GuardDuty.DisableOrganizationAdminAccount",
    operation: guardduty.disableOrganizationAdminAccount,
    actions: ["guardduty:DisableOrganizationAdminAccount"],
}));
//# sourceMappingURL=DisableOrganizationAdminAccountHttp.js.map