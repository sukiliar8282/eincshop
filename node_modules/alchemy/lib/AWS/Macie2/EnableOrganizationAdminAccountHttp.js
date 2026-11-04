import * as macie2 from "@distilled.cloud/aws/macie2";
import * as Layer from "effect/Layer";
import { makeMacie2HttpBinding } from "./BindingHttp.js";
import { EnableOrganizationAdminAccount } from "./EnableOrganizationAdminAccount.js";
export const EnableOrganizationAdminAccountHttp = Layer.effect(EnableOrganizationAdminAccount, makeMacie2HttpBinding({
    tag: "AWS.Macie2.EnableOrganizationAdminAccount",
    operation: macie2.enableOrganizationAdminAccount,
    actions: ["macie2:EnableOrganizationAdminAccount"],
}));
//# sourceMappingURL=EnableOrganizationAdminAccountHttp.js.map