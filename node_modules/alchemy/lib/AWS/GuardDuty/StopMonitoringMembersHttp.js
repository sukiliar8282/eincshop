import * as guardduty from "@distilled.cloud/aws/guardduty";
import * as Layer from "effect/Layer";
import { makeGuardDutyDetectorHttpBinding } from "./BindingHttp.js";
import { StopMonitoringMembers } from "./StopMonitoringMembers.js";
export const StopMonitoringMembersHttp = Layer.effect(StopMonitoringMembers, makeGuardDutyDetectorHttpBinding({
    tag: "AWS.GuardDuty.StopMonitoringMembers",
    operation: guardduty.stopMonitoringMembers,
    actions: ["guardduty:StopMonitoringMembers"],
}));
//# sourceMappingURL=StopMonitoringMembersHttp.js.map