import * as guardduty from "@distilled.cloud/aws/guardduty";
import * as Layer from "effect/Layer";
import { makeGuardDutyAccountHttpBinding } from "./BindingHttp.js";
import { GetInvitationsCount } from "./GetInvitationsCount.js";
export const GetInvitationsCountHttp = Layer.effect(GetInvitationsCount, makeGuardDutyAccountHttpBinding({
    tag: "AWS.GuardDuty.GetInvitationsCount",
    operation: guardduty.getInvitationsCount,
    actions: ["guardduty:GetInvitationsCount"],
}));
//# sourceMappingURL=GetInvitationsCountHttp.js.map