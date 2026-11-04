import * as cloudwatch from "@distilled.cloud/aws/cloudwatch";
import * as Layer from "effect/Layer";
import { makeCloudWatchAccountHttpBinding } from "./BindingHttp.js";
import { ListMetricStreams } from "./ListMetricStreams.js";
export const ListMetricStreamsHttp = Layer.effect(ListMetricStreams, makeCloudWatchAccountHttpBinding({
    tag: "AWS.CloudWatch.ListMetricStreams",
    operation: cloudwatch.listMetricStreams,
    actions: ["cloudwatch:ListMetricStreams"],
}));
//# sourceMappingURL=ListMetricStreamsHttp.js.map