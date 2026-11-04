import * as codebuild from "@distilled.cloud/aws/codebuild";
import * as Layer from "effect/Layer";
import { makeCodeBuildProjectHttpBinding } from "./BindingHttp.js";
import { StopSandbox } from "./StopSandbox.js";
export const StopSandboxHttp = Layer.effect(StopSandbox, makeCodeBuildProjectHttpBinding({
    tag: "AWS.CodeBuild.StopSandbox",
    operation: codebuild.stopSandbox,
    actions: ["codebuild:StopSandbox"],
    sandboxScoped: true,
}));
//# sourceMappingURL=StopSandboxHttp.js.map