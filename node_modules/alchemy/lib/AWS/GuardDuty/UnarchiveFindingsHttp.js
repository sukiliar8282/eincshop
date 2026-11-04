import * as guardduty from "@distilled.cloud/aws/guardduty";
import * as Layer from "effect/Layer";
import { makeGuardDutyDetectorHttpBinding } from "./BindingHttp.js";
import { UnarchiveFindings } from "./UnarchiveFindings.js";
export const UnarchiveFindingsHttp = Layer.effect(UnarchiveFindings, makeGuardDutyDetectorHttpBinding({
    tag: "AWS.GuardDuty.UnarchiveFindings",
    operation: guardduty.unarchiveFindings,
    actions: ["guardduty:UnarchiveFindings"],
}));
//# sourceMappingURL=UnarchiveFindingsHttp.js.map