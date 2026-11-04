import * as codebuild from "@distilled.cloud/aws/codebuild";
import * as Layer from "effect/Layer";
import { makeCodeBuildProjectHttpBinding } from "./BindingHttp.js";
import { StartCommandExecution } from "./StartCommandExecution.js";
export const StartCommandExecutionHttp = Layer.effect(StartCommandExecution, makeCodeBuildProjectHttpBinding({
    tag: "AWS.CodeBuild.StartCommandExecution",
    operation: codebuild.startCommandExecution,
    actions: ["codebuild:StartCommandExecution"],
    sandboxScoped: true,
}));
//# sourceMappingURL=StartCommandExecutionHttp.js.map