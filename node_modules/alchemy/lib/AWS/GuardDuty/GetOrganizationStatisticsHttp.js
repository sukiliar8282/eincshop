import * as guardduty from "@distilled.cloud/aws/guardduty";
import * as Layer from "effect/Layer";
import { makeGuardDutyAccountHttpBinding } from "./BindingHttp.js";
import { GetOrganizationStatistics } from "./GetOrganizationStatistics.js";
export const GetOrganizationStatisticsHttp = Layer.effect(GetOrganizationStatistics, makeGuardDutyAccountHttpBinding({
    tag: "AWS.GuardDuty.GetOrganizationStatistics",
    operation: guardduty.getOrganizationStatistics,
    actions: ["guardduty:GetOrganizationStatistics"],
}));
//# sourceMappingURL=GetOrganizationStatisticsHttp.js.map