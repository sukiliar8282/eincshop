import * as securityhub from "@distilled.cloud/aws/securityhub";
import * as Layer from "effect/Layer";
import { makeSecurityHubHttpBinding } from "./BindingHttp.js";
import { GetAdministratorAccount } from "./GetAdministratorAccount.js";
export const GetAdministratorAccountHttp = Layer.effect(GetAdministratorAccount, makeSecurityHubHttpBinding({
    tag: "AWS.SecurityHub.GetAdministratorAccount",
    operation: securityhub.getAdministratorAccount,
    actions: ["securityhub:GetAdministratorAccount"],
}));
//# sourceMappingURL=GetAdministratorAccountHttp.js.map