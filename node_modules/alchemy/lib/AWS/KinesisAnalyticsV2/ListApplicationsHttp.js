import * as analytics from "@distilled.cloud/aws/kinesis-analytics-v2";
import * as Layer from "effect/Layer";
import { makeKinesisAnalyticsAccountHttpBinding } from "./BindingHttp.js";
import { ListApplications } from "./ListApplications.js";
export const ListApplicationsHttp = Layer.effect(ListApplications, makeKinesisAnalyticsAccountHttpBinding({
    tag: "AWS.KinesisAnalyticsV2.ListApplications",
    operation: analytics.listApplications,
    actions: ["kinesisanalytics:ListApplications"],
}));
//# sourceMappingURL=ListApplicationsHttp.js.map