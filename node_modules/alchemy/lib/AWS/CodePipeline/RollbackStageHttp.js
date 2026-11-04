import * as codepipeline from "@distilled.cloud/aws/codepipeline";
import * as Layer from "effect/Layer";
import { makeCodePipelinePipelineNameHttpBinding } from "./BindingHttp.js";
import { RollbackStage } from "./RollbackStage.js";
export const RollbackStageHttp = Layer.effect(RollbackStage, makeCodePipelinePipelineNameHttpBinding({
    tag: "AWS.CodePipeline.RollbackStage",
    operation: codepipeline.rollbackStage,
    actions: ["codepipeline:RollbackStage"],
    subScoped: true,
}));
//# sourceMappingURL=RollbackStageHttp.js.map