import * as securityhub from "@distilled.cloud/aws/securityhub";
import * as Layer from "effect/Layer";
import { makeSecurityHubHttpBinding } from "./BindingHttp.js";
import { DisableOrganizationAdminAccount } from "./DisableOrganizationAdminAccount.js";
export const DisableOrganizationAdminAccountHttp = Layer.effect(DisableOrganizationAdminAccount, makeSecurityHubHttpBinding({
    tag: "AWS.SecurityHub.DisableOrganizationAdminAccount",
    operation: securityhub.disableOrganizationAdminAccount,
    actions: ["securityhub:DisableOrganizationAdminAccount"],
}));
//# sourceMappingURL=DisableOrganizationAdminAccountHttp.js.map