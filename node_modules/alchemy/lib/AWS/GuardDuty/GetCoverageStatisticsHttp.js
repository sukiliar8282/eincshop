import * as guardduty from "@distilled.cloud/aws/guardduty";
import * as Layer from "effect/Layer";
import { makeGuardDutyDetectorHttpBinding } from "./BindingHttp.js";
import { GetCoverageStatistics } from "./GetCoverageStatistics.js";
export const GetCoverageStatisticsHttp = Layer.effect(GetCoverageStatistics, makeGuardDutyDetectorHttpBinding({
    tag: "AWS.GuardDuty.GetCoverageStatistics",
    operation: guardduty.getCoverageStatistics,
    actions: ["guardduty:GetCoverageStatistics"],
    // One of the two GuardDuty actions that supports resource-level
    // permissions on the detector ARN.
    resourceLevel: true,
}));
//# sourceMappingURL=GetCoverageStatisticsHttp.js.map