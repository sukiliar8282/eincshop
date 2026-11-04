import * as codebuild from "@distilled.cloud/aws/codebuild";
import * as Layer from "effect/Layer";
import { makeCodeBuildProjectHttpBinding } from "./BindingHttp.js";
import { StopBuild } from "./StopBuild.js";
export const StopBuildHttp = Layer.effect(StopBuild, makeCodeBuildProjectHttpBinding({
    tag: "AWS.CodeBuild.StopBuild",
    operation: codebuild.stopBuild,
    actions: ["codebuild:StopBuild"],
}));
//# sourceMappingURL=StopBuildHttp.js.map