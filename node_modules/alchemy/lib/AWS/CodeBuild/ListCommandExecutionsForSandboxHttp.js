import * as codebuild from "@distilled.cloud/aws/codebuild";
import * as Layer from "effect/Layer";
import { makeCodeBuildProjectHttpBinding } from "./BindingHttp.js";
import { ListCommandExecutionsForSandbox } from "./ListCommandExecutionsForSandbox.js";
export const ListCommandExecutionsForSandboxHttp = Layer.effect(ListCommandExecutionsForSandbox, makeCodeBuildProjectHttpBinding({
    tag: "AWS.CodeBuild.ListCommandExecutionsForSandbox",
    operation: codebuild.listCommandExecutionsForSandbox,
    actions: ["codebuild:ListCommandExecutionsForSandbox"],
    sandboxScoped: true,
}));
//# sourceMappingURL=ListCommandExecutionsForSandboxHttp.js.map