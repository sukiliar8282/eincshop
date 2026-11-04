import * as cloudwatch from "@distilled.cloud/aws/cloudwatch";
import * as Layer from "effect/Layer";
import { makeCloudWatchAccountHttpBinding } from "./BindingHttp.js";
import { ListDashboards } from "./ListDashboards.js";
export const ListDashboardsHttp = Layer.effect(ListDashboards, makeCloudWatchAccountHttpBinding({
    tag: "AWS.CloudWatch.ListDashboards",
    operation: cloudwatch.listDashboards,
    actions: ["cloudwatch:ListDashboards"],
}));
//# sourceMappingURL=ListDashboardsHttp.js.map