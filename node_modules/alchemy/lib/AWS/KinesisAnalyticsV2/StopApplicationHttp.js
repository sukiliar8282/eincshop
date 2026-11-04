import * as analytics from "@distilled.cloud/aws/kinesis-analytics-v2";
import * as Layer from "effect/Layer";
import { makeKinesisAnalyticsHttpBinding } from "./BindingHttp.js";
import { StopApplication } from "./StopApplication.js";
export const StopApplicationHttp = Layer.effect(StopApplication, makeKinesisAnalyticsHttpBinding({
    tag: "AWS.KinesisAnalyticsV2.StopApplication",
    operation: analytics.stopApplication,
    actions: ["kinesisanalytics:StopApplication"],
}));
//# sourceMappingURL=StopApplicationHttp.js.map