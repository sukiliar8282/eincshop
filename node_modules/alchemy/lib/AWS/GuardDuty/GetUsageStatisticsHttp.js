import * as guardduty from "@distilled.cloud/aws/guardduty";
import * as Layer from "effect/Layer";
import { makeGuardDutyDetectorHttpBinding } from "./BindingHttp.js";
import { GetUsageStatistics } from "./GetUsageStatistics.js";
export const GetUsageStatisticsHttp = Layer.effect(GetUsageStatistics, makeGuardDutyDetectorHttpBinding({
    tag: "AWS.GuardDuty.GetUsageStatistics",
    operation: guardduty.getUsageStatistics,
    actions: ["guardduty:GetUsageStatistics"],
}));
//# sourceMappingURL=GetUsageStatisticsHttp.js.map