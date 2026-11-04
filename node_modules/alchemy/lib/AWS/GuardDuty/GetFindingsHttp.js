import * as guardduty from "@distilled.cloud/aws/guardduty";
import * as Layer from "effect/Layer";
import { makeGuardDutyDetectorHttpBinding } from "./BindingHttp.js";
import { GetFindings } from "./GetFindings.js";
export const GetFindingsHttp = Layer.effect(GetFindings, makeGuardDutyDetectorHttpBinding({
    tag: "AWS.GuardDuty.GetFindings",
    operation: guardduty.getFindings,
    actions: ["guardduty:GetFindings"],
}));
//# sourceMappingURL=GetFindingsHttp.js.map