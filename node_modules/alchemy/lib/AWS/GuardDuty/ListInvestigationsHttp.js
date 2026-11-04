import * as guardduty from "@distilled.cloud/aws/guardduty";
import * as Layer from "effect/Layer";
import { makeGuardDutyDetectorHttpBinding } from "./BindingHttp.js";
import { ListInvestigations } from "./ListInvestigations.js";
export const ListInvestigationsHttp = Layer.effect(ListInvestigations, makeGuardDutyDetectorHttpBinding({
    tag: "AWS.GuardDuty.ListInvestigations",
    operation: guardduty.listInvestigations,
    actions: ["guardduty:ListInvestigations"],
}));
//# sourceMappingURL=ListInvestigationsHttp.js.map