import * as cloudtrail from "@distilled.cloud/aws/cloudtrail";
import * as Layer from "effect/Layer";
import { makeCloudTrailAccountHttpBinding } from "./BindingHttp.js";
import { ListInsightsData } from "./ListInsightsData.js";
export const ListInsightsDataHttp = Layer.effect(ListInsightsData, makeCloudTrailAccountHttpBinding({
    tag: "AWS.CloudTrail.ListInsightsData",
    operation: cloudtrail.listInsightsData,
    actions: ["cloudtrail:ListInsightsData"],
}));
//# sourceMappingURL=ListInsightsDataHttp.js.map