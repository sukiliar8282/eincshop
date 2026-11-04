import * as codebuild from "@distilled.cloud/aws/codebuild";
import * as Layer from "effect/Layer";
import { makeCodeBuildReportGroupHttpBinding } from "./BindingHttp.js";
import { DescribeTestCases } from "./DescribeTestCases.js";
export const DescribeTestCasesHttp = Layer.effect(DescribeTestCases, makeCodeBuildReportGroupHttpBinding({
    tag: "AWS.CodeBuild.DescribeTestCases",
    operation: codebuild.describeTestCases,
    actions: ["codebuild:DescribeTestCases"],
}));
//# sourceMappingURL=DescribeTestCasesHttp.js.map