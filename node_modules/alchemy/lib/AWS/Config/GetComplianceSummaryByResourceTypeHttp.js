import * as config from "@distilled.cloud/aws/config-service";
import * as Layer from "effect/Layer";
import { makeConfigAccountHttpBinding } from "./BindingHttp.js";
import { GetComplianceSummaryByResourceType } from "./GetComplianceSummaryByResourceType.js";
export const GetComplianceSummaryByResourceTypeHttp = Layer.effect(GetComplianceSummaryByResourceType, makeConfigAccountHttpBinding({
    tag: "AWS.Config.GetComplianceSummaryByResourceType",
    operation: config.getComplianceSummaryByResourceType,
    actions: ["config:GetComplianceSummaryByResourceType"],
}));
//# sourceMappingURL=GetComplianceSummaryByResourceTypeHttp.js.map