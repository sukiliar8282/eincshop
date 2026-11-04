import * as codepipeline from "@distilled.cloud/aws/codepipeline";
import * as Layer from "effect/Layer";
import { makeCodePipelinePipelineNameHttpBinding } from "./BindingHttp.js";
import { EnableStageTransition } from "./EnableStageTransition.js";
export const EnableStageTransitionHttp = Layer.effect(EnableStageTransition, makeCodePipelinePipelineNameHttpBinding({
    tag: "AWS.CodePipeline.EnableStageTransition",
    operation: codepipeline.enableStageTransition,
    actions: ["codepipeline:EnableStageTransition"],
    subScoped: true,
}));
//# sourceMappingURL=EnableStageTransitionHttp.js.map