import * as cloudwatch from "@distilled.cloud/aws/cloudwatch";
import * as Layer from "effect/Layer";
import { makeCloudWatchResourceHttpBinding } from "./BindingHttp.js";
import { GetMetricStream } from "./GetMetricStream.js";
export const GetMetricStreamHttp = Layer.effect(GetMetricStream, makeCloudWatchResourceHttpBinding({
    tag: "AWS.CloudWatch.GetMetricStream",
    operation: cloudwatch.getMetricStream,
    actions: ["cloudwatch:GetMetricStream"],
    requestKey: "Name",
    identifier: (metricStream) => metricStream.metricStreamName,
    resourceArn: (metricStream) => metricStream.metricStreamArn,
}));
//# sourceMappingURL=GetMetricStreamHttp.js.map