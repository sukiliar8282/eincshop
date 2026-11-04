import * as analytics from "@distilled.cloud/aws/kinesis-analytics-v2";
import * as Layer from "effect/Layer";
import { makeKinesisAnalyticsHttpBinding } from "./BindingHttp.js";
import { StartApplication } from "./StartApplication.js";
export const StartApplicationHttp = Layer.effect(StartApplication, makeKinesisAnalyticsHttpBinding({
    tag: "AWS.KinesisAnalyticsV2.StartApplication",
    operation: analytics.startApplication,
    actions: ["kinesisanalytics:StartApplication"],
}));
//# sourceMappingURL=StartApplicationHttp.js.map