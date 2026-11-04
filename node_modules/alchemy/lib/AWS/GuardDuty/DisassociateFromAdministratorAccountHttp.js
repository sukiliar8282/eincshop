import * as guardduty from "@distilled.cloud/aws/guardduty";
import * as Layer from "effect/Layer";
import { makeGuardDutyDetectorHttpBinding } from "./BindingHttp.js";
import { DisassociateFromAdministratorAccount } from "./DisassociateFromAdministratorAccount.js";
export const DisassociateFromAdministratorAccountHttp = Layer.effect(DisassociateFromAdministratorAccount, makeGuardDutyDetectorHttpBinding({
    tag: "AWS.GuardDuty.DisassociateFromAdministratorAccount",
    operation: guardduty.disassociateFromAdministratorAccount,
    actions: ["guardduty:DisassociateFromAdministratorAccount"],
}));
//# sourceMappingURL=DisassociateFromAdministratorAccountHttp.js.map