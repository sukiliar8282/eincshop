import * as guardduty from "@distilled.cloud/aws/guardduty";
import * as Layer from "effect/Layer";
import { makeGuardDutyDetectorHttpBinding } from "./BindingHttp.js";
import { UpdateMemberDetectors } from "./UpdateMemberDetectors.js";
export const UpdateMemberDetectorsHttp = Layer.effect(UpdateMemberDetectors, makeGuardDutyDetectorHttpBinding({
    tag: "AWS.GuardDuty.UpdateMemberDetectors",
    operation: guardduty.updateMemberDetectors,
    actions: ["guardduty:UpdateMemberDetectors"],
}));
//# sourceMappingURL=UpdateMemberDetectorsHttp.js.map