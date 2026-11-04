import * as detective from "@distilled.cloud/aws/detective";
import * as Layer from "effect/Layer";
import { makeDetectiveAccountHttpBinding } from "./BindingHttp.js";
import { EnableOrganizationAdminAccount } from "./EnableOrganizationAdminAccount.js";
export const EnableOrganizationAdminAccountHttp = Layer.effect(EnableOrganizationAdminAccount, makeDetectiveAccountHttpBinding({
    tag: "AWS.Detective.EnableOrganizationAdminAccount",
    operation: detective.enableOrganizationAdminAccount,
    actions: ["detective:EnableOrganizationAdminAccount"],
}));
//# sourceMappingURL=EnableOrganizationAdminAccountHttp.js.map