import * as cloudwatch from "@distilled.cloud/aws/cloudwatch";
import * as Layer from "effect/Layer";
import { makeCloudWatchResourceHttpBinding } from "./BindingHttp.js";
import { GetDashboard } from "./GetDashboard.js";
export const GetDashboardHttp = Layer.effect(GetDashboard, makeCloudWatchResourceHttpBinding({
    tag: "AWS.CloudWatch.GetDashboard",
    operation: cloudwatch.getDashboard,
    actions: ["cloudwatch:GetDashboard"],
    requestKey: "DashboardName",
    identifier: (dashboard) => dashboard.dashboardName,
    resourceArn: (dashboard) => dashboard.dashboardArn,
}));
//# sourceMappingURL=GetDashboardHttp.js.map