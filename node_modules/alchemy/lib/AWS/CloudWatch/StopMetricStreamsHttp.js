import * as cloudwatch from "@distilled.cloud/aws/cloudwatch";
import * as Layer from "effect/Layer";
import { makeCloudWatchResourceSetHttpBinding } from "./BindingHttp.js";
import { StopMetricStreams } from "./StopMetricStreams.js";
export const StopMetricStreamsHttp = Layer.effect(StopMetricStreams, makeCloudWatchResourceSetHttpBinding({
    tag: "AWS.CloudWatch.StopMetricStreams",
    operation: cloudwatch.stopMetricStreams,
    action: "cloudwatch:StopMetricStreams",
    namesKey: "Names",
    name: (metricStream) => metricStream.metricStreamName,
    arn: (metricStream) => metricStream.metricStreamArn,
}));
//# sourceMappingURL=StopMetricStreamsHttp.js.map