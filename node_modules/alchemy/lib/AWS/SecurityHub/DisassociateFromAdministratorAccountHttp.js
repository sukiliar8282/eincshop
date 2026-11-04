import * as securityhub from "@distilled.cloud/aws/securityhub";
import * as Layer from "effect/Layer";
import { makeSecurityHubHttpBinding } from "./BindingHttp.js";
import { DisassociateFromAdministratorAccount } from "./DisassociateFromAdministratorAccount.js";
export const DisassociateFromAdministratorAccountHttp = Layer.effect(DisassociateFromAdministratorAccount, makeSecurityHubHttpBinding({
    tag: "AWS.SecurityHub.DisassociateFromAdministratorAccount",
    operation: securityhub.disassociateFromAdministratorAccount,
    actions: ["securityhub:DisassociateFromAdministratorAccount"],
}));
//# sourceMappingURL=DisassociateFromAdministratorAccountHttp.js.map