import * as guardduty from "@distilled.cloud/aws/guardduty";
import * as Layer from "effect/Layer";
import { makeGuardDutyDetectorHttpBinding } from "./BindingHttp.js";
import { GetMembers } from "./GetMembers.js";
export const GetMembersHttp = Layer.effect(GetMembers, makeGuardDutyDetectorHttpBinding({
    tag: "AWS.GuardDuty.GetMembers",
    operation: guardduty.getMembers,
    actions: ["guardduty:GetMembers"],
}));
//# sourceMappingURL=GetMembersHttp.js.map