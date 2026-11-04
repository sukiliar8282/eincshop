import * as codebuild from "@distilled.cloud/aws/codebuild";
import * as Layer from "effect/Layer";
import { makeCodeBuildProjectHttpBinding } from "./BindingHttp.js";
import { RetryBuild } from "./RetryBuild.js";
export const RetryBuildHttp = Layer.effect(RetryBuild, makeCodeBuildProjectHttpBinding({
    tag: "AWS.CodeBuild.RetryBuild",
    operation: codebuild.retryBuild,
    actions: ["codebuild:RetryBuild"],
}));
//# sourceMappingURL=RetryBuildHttp.js.map