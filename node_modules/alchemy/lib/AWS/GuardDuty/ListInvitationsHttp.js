import * as guardduty from "@distilled.cloud/aws/guardduty";
import * as Layer from "effect/Layer";
import { makeGuardDutyAccountHttpBinding } from "./BindingHttp.js";
import { ListInvitations } from "./ListInvitations.js";
export const ListInvitationsHttp = Layer.effect(ListInvitations, makeGuardDutyAccountHttpBinding({
    tag: "AWS.GuardDuty.ListInvitations",
    operation: guardduty.listInvitations,
    actions: ["guardduty:ListInvitations"],
}));
//# sourceMappingURL=ListInvitationsHttp.js.map