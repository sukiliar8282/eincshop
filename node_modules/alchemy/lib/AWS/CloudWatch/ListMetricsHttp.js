import * as cloudwatch from "@distilled.cloud/aws/cloudwatch";
import * as Layer from "effect/Layer";
import { makeCloudWatchAccountHttpBinding } from "./BindingHttp.js";
import { ListMetrics } from "./ListMetrics.js";
export const ListMetricsHttp = Layer.effect(ListMetrics, makeCloudWatchAccountHttpBinding({
    tag: "AWS.CloudWatch.ListMetrics",
    operation: cloudwatch.listMetrics,
    actions: ["cloudwatch:ListMetrics"],
}));
//# sourceMappingURL=ListMetricsHttp.js.map