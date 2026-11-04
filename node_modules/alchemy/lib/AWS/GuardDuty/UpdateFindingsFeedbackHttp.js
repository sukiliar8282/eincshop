import * as guardduty from "@distilled.cloud/aws/guardduty";
import * as Layer from "effect/Layer";
import { makeGuardDutyDetectorHttpBinding } from "./BindingHttp.js";
import { UpdateFindingsFeedback } from "./UpdateFindingsFeedback.js";
export const UpdateFindingsFeedbackHttp = Layer.effect(UpdateFindingsFeedback, makeGuardDutyDetectorHttpBinding({
    tag: "AWS.GuardDuty.UpdateFindingsFeedback",
    operation: guardduty.updateFindingsFeedback,
    actions: ["guardduty:UpdateFindingsFeedback"],
}));
//# sourceMappingURL=UpdateFindingsFeedbackHttp.js.map