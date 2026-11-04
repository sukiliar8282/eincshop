import * as guardduty from "@distilled.cloud/aws/guardduty";
import * as Layer from "effect/Layer";
import { makeGuardDutyAccountHttpBinding } from "./BindingHttp.js";
import { EnableOrganizationAdminAccount } from "./EnableOrganizationAdminAccount.js";
export const EnableOrganizationAdminAccountHttp = Layer.effect(EnableOrganizationAdminAccount, makeGuardDutyAccountHttpBinding({
    tag: "AWS.GuardDuty.EnableOrganizationAdminAccount",
    operation: guardduty.enableOrganizationAdminAccount,
    actions: ["guardduty:EnableOrganizationAdminAccount"],
}));
//# sourceMappingURL=EnableOrganizationAdminAccountHttp.js.map