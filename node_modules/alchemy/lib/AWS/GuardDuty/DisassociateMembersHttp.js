import * as guardduty from "@distilled.cloud/aws/guardduty";
import * as Layer from "effect/Layer";
import { makeGuardDutyDetectorHttpBinding } from "./BindingHttp.js";
import { DisassociateMembers } from "./DisassociateMembers.js";
export const DisassociateMembersHttp = Layer.effect(DisassociateMembers, makeGuardDutyDetectorHttpBinding({
    tag: "AWS.GuardDuty.DisassociateMembers",
    operation: guardduty.disassociateMembers,
    actions: ["guardduty:DisassociateMembers"],
}));
//# sourceMappingURL=DisassociateMembersHttp.js.map