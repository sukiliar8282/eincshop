import * as cloudwatch from "@distilled.cloud/aws/cloudwatch";
import * as Layer from "effect/Layer";
import { makeCloudWatchResourceSetHttpBinding } from "./BindingHttp.js";
import { StartMetricStreams } from "./StartMetricStreams.js";
export const StartMetricStreamsHttp = Layer.effect(StartMetricStreams, makeCloudWatchResourceSetHttpBinding({
    tag: "AWS.CloudWatch.StartMetricStreams",
    operation: cloudwatch.startMetricStreams,
    action: "cloudwatch:StartMetricStreams",
    namesKey: "Names",
    name: (metricStream) => metricStream.metricStreamName,
    arn: (metricStream) => metricStream.metricStreamArn,
}));
//# sourceMappingURL=StartMetricStreamsHttp.js.map