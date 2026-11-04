import * as codebuild from "@distilled.cloud/aws/codebuild";
import * as Layer from "effect/Layer";
import { makeCodeBuildProjectNameHttpBinding } from "./BindingHttp.js";
import { StartSandbox } from "./StartSandbox.js";
export const StartSandboxHttp = Layer.effect(StartSandbox, makeCodeBuildProjectNameHttpBinding({
    tag: "AWS.CodeBuild.StartSandbox",
    operation: codebuild.startSandbox,
    actions: ["codebuild:StartSandbox"],
}));
//# sourceMappingURL=StartSandboxHttp.js.map