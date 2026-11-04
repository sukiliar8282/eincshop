import * as securityhub from "@distilled.cloud/aws/securityhub";
import * as Layer from "effect/Layer";
import { makeSecurityHubHttpBinding } from "./BindingHttp.js";
import { EnableOrganizationAdminAccount } from "./EnableOrganizationAdminAccount.js";
export const EnableOrganizationAdminAccountHttp = Layer.effect(EnableOrganizationAdminAccount, makeSecurityHubHttpBinding({
    tag: "AWS.SecurityHub.EnableOrganizationAdminAccount",
    operation: securityhub.enableOrganizationAdminAccount,
    actions: ["securityhub:EnableOrganizationAdminAccount"],
}));
//# sourceMappingURL=EnableOrganizationAdminAccountHttp.js.map