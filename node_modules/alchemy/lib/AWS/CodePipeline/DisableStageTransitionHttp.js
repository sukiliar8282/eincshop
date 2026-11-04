import * as codepipeline from "@distilled.cloud/aws/codepipeline";
import * as Layer from "effect/Layer";
import { makeCodePipelinePipelineNameHttpBinding } from "./BindingHttp.js";
import { DisableStageTransition } from "./DisableStageTransition.js";
export const DisableStageTransitionHttp = Layer.effect(DisableStageTransition, makeCodePipelinePipelineNameHttpBinding({
    tag: "AWS.CodePipeline.DisableStageTransition",
    operation: codepipeline.disableStageTransition,
    actions: ["codepipeline:DisableStageTransition"],
    subScoped: true,
}));
//# sourceMappingURL=DisableStageTransitionHttp.js.map