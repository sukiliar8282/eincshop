import * as guardduty from "@distilled.cloud/aws/guardduty";
import * as Layer from "effect/Layer";
import { makeGuardDutyDetectorHttpBinding } from "./BindingHttp.js";
import { GetFindingsStatistics } from "./GetFindingsStatistics.js";
export const GetFindingsStatisticsHttp = Layer.effect(GetFindingsStatistics, makeGuardDutyDetectorHttpBinding({
    tag: "AWS.GuardDuty.GetFindingsStatistics",
    operation: guardduty.getFindingsStatistics,
    actions: ["guardduty:GetFindingsStatistics"],
}));
//# sourceMappingURL=GetFindingsStatisticsHttp.js.map