import * as emr from "@distilled.cloud/aws/emr-serverless";
import * as Layer from "effect/Layer";
import { makeEmrServerlessHttpBinding } from "./BindingHttp.js";
import { GetDashboardForJobRun } from "./GetDashboardForJobRun.js";
export const GetDashboardForJobRunHttp = Layer.effect(GetDashboardForJobRun, makeEmrServerlessHttpBinding({
    tag: "AWS.EMRServerless.GetDashboardForJobRun",
    operation: emr.getDashboardForJobRun,
    actions: ["emr-serverless:GetDashboardForJobRun"],
    subresources: ["/jobruns/*"],
}));
//# sourceMappingURL=GetDashboardForJobRunHttp.js.map