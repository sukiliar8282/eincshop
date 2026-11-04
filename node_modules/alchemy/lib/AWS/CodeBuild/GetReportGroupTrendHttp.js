import * as codebuild from "@distilled.cloud/aws/codebuild";
import * as Layer from "effect/Layer";
import { makeCodeBuildReportGroupArnHttpBinding } from "./BindingHttp.js";
import { GetReportGroupTrend } from "./GetReportGroupTrend.js";
export const GetReportGroupTrendHttp = Layer.effect(GetReportGroupTrend, makeCodeBuildReportGroupArnHttpBinding({
    tag: "AWS.CodeBuild.GetReportGroupTrend",
    operation: codebuild.getReportGroupTrend,
    actions: ["codebuild:GetReportGroupTrend"],
}));
//# sourceMappingURL=GetReportGroupTrendHttp.js.map