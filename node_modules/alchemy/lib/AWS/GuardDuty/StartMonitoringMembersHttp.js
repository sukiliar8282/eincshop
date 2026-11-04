import * as guardduty from "@distilled.cloud/aws/guardduty";
import * as Layer from "effect/Layer";
import { makeGuardDutyDetectorHttpBinding } from "./BindingHttp.js";
import { StartMonitoringMembers } from "./StartMonitoringMembers.js";
export const StartMonitoringMembersHttp = Layer.effect(StartMonitoringMembers, makeGuardDutyDetectorHttpBinding({
    tag: "AWS.GuardDuty.StartMonitoringMembers",
    operation: guardduty.startMonitoringMembers,
    actions: ["guardduty:StartMonitoringMembers"],
}));
//# sourceMappingURL=StartMonitoringMembersHttp.js.map