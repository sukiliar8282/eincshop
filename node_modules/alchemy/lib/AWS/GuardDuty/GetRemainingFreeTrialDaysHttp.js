import * as guardduty from "@distilled.cloud/aws/guardduty";
import * as Layer from "effect/Layer";
import { makeGuardDutyDetectorHttpBinding } from "./BindingHttp.js";
import { GetRemainingFreeTrialDays } from "./GetRemainingFreeTrialDays.js";
export const GetRemainingFreeTrialDaysHttp = Layer.effect(GetRemainingFreeTrialDays, makeGuardDutyDetectorHttpBinding({
    tag: "AWS.GuardDuty.GetRemainingFreeTrialDays",
    operation: guardduty.getRemainingFreeTrialDays,
    actions: ["guardduty:GetRemainingFreeTrialDays"],
}));
//# sourceMappingURL=GetRemainingFreeTrialDaysHttp.js.map