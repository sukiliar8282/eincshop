import * as codepipeline from "@distilled.cloud/aws/codepipeline";
import * as Layer from "effect/Layer";
import { makeCodePipelinePipelineNameHttpBinding } from "./BindingHttp.js";
import { ListDeployActionExecutionTargets } from "./ListDeployActionExecutionTargets.js";
export const ListDeployActionExecutionTargetsHttp = Layer.effect(ListDeployActionExecutionTargets, makeCodePipelinePipelineNameHttpBinding({
    tag: "AWS.CodePipeline.ListDeployActionExecutionTargets",
    operation: codepipeline.listDeployActionExecutionTargets,
    actions: ["codepipeline:ListDeployActionExecutionTargets"],
    subScoped: true,
}));
//# sourceMappingURL=ListDeployActionExecutionTargetsHttp.js.map