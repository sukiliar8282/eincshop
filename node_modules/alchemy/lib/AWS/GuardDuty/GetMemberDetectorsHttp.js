import * as guardduty from "@distilled.cloud/aws/guardduty";
import * as Layer from "effect/Layer";
import { makeGuardDutyDetectorHttpBinding } from "./BindingHttp.js";
import { GetMemberDetectors } from "./GetMemberDetectors.js";
export const GetMemberDetectorsHttp = Layer.effect(GetMemberDetectors, makeGuardDutyDetectorHttpBinding({
    tag: "AWS.GuardDuty.GetMemberDetectors",
    operation: guardduty.getMemberDetectors,
    actions: ["guardduty:GetMemberDetectors"],
}));
//# sourceMappingURL=GetMemberDetectorsHttp.js.map