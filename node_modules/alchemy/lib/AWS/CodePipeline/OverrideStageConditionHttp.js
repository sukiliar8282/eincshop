import * as codepipeline from "@distilled.cloud/aws/codepipeline";
import * as Layer from "effect/Layer";
import { makeCodePipelinePipelineNameHttpBinding } from "./BindingHttp.js";
import { OverrideStageCondition } from "./OverrideStageCondition.js";
export const OverrideStageConditionHttp = Layer.effect(OverrideStageCondition, makeCodePipelinePipelineNameHttpBinding({
    tag: "AWS.CodePipeline.OverrideStageCondition",
    operation: codepipeline.overrideStageCondition,
    actions: ["codepipeline:OverrideStageCondition"],
    subScoped: true,
}));
//# sourceMappingURL=OverrideStageConditionHttp.js.map