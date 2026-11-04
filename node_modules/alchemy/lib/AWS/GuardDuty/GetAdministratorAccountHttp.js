import * as guardduty from "@distilled.cloud/aws/guardduty";
import * as Layer from "effect/Layer";
import { makeGuardDutyDetectorHttpBinding } from "./BindingHttp.js";
import { GetAdministratorAccount } from "./GetAdministratorAccount.js";
export const GetAdministratorAccountHttp = Layer.effect(GetAdministratorAccount, makeGuardDutyDetectorHttpBinding({
    tag: "AWS.GuardDuty.GetAdministratorAccount",
    operation: guardduty.getAdministratorAccount,
    actions: ["guardduty:GetAdministratorAccount"],
}));
//# sourceMappingURL=GetAdministratorAccountHttp.js.map