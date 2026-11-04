import * as guardduty from "@distilled.cloud/aws/guardduty";
import * as Layer from "effect/Layer";
import { makeGuardDutyDetectorHttpBinding } from "./BindingHttp.js";
import { GetInvestigation } from "./GetInvestigation.js";
export const GetInvestigationHttp = Layer.effect(GetInvestigation, makeGuardDutyDetectorHttpBinding({
    tag: "AWS.GuardDuty.GetInvestigation",
    operation: guardduty.getInvestigation,
    actions: ["guardduty:GetInvestigation"],
}));
//# sourceMappingURL=GetInvestigationHttp.js.map