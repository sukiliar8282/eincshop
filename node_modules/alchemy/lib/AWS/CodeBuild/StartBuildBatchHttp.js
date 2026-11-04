import * as codebuild from "@distilled.cloud/aws/codebuild";
import * as Layer from "effect/Layer";
import { makeCodeBuildProjectNameHttpBinding } from "./BindingHttp.js";
import { StartBuildBatch } from "./StartBuildBatch.js";
export const StartBuildBatchHttp = Layer.effect(StartBuildBatch, makeCodeBuildProjectNameHttpBinding({
    tag: "AWS.CodeBuild.StartBuildBatch",
    operation: codebuild.startBuildBatch,
    actions: ["codebuild:StartBuildBatch"],
}));
//# sourceMappingURL=StartBuildBatchHttp.js.map