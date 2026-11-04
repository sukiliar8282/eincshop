import * as guardduty from "@distilled.cloud/aws/guardduty";
import * as Layer from "effect/Layer";
import { makeGuardDutyDetectorHttpBinding } from "./BindingHttp.js";
import { ListMembers } from "./ListMembers.js";
export const ListMembersHttp = Layer.effect(ListMembers, makeGuardDutyDetectorHttpBinding({
    tag: "AWS.GuardDuty.ListMembers",
    operation: guardduty.listMembers,
    actions: ["guardduty:ListMembers"],
}));
//# sourceMappingURL=ListMembersHttp.js.map