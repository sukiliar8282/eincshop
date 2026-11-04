import * as cloudwatch from "@distilled.cloud/aws/cloudwatch";
import * as Layer from "effect/Layer";
import { makeCloudWatchAccountHttpBinding } from "./BindingHttp.js";
import { GetMetricData } from "./GetMetricData.js";
export const GetMetricDataHttp = Layer.effect(GetMetricData, makeCloudWatchAccountHttpBinding({
    tag: "AWS.CloudWatch.GetMetricData",
    operation: cloudwatch.getMetricData,
    actions: ["cloudwatch:GetMetricData"],
}));
//# sourceMappingURL=GetMetricDataHttp.js.map