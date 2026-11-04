import * as cloudtrail from "@distilled.cloud/aws/cloudtrail";
import * as Layer from "effect/Layer";
import { makeCloudTrailAccountHttpBinding } from "./BindingHttp.js";
import { ListInsightsMetricData } from "./ListInsightsMetricData.js";
export const ListInsightsMetricDataHttp = Layer.effect(ListInsightsMetricData, makeCloudTrailAccountHttpBinding({
    tag: "AWS.CloudTrail.ListInsightsMetricData",
    operation: cloudtrail.listInsightsMetricData,
    actions: ["cloudtrail:ListInsightsMetricData"],
}));
//# sourceMappingURL=ListInsightsMetricDataHttp.js.map