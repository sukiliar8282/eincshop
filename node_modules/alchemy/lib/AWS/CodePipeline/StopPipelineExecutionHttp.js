import * as codepipeline from "@distilled.cloud/aws/codepipeline";
import * as Layer from "effect/Layer";
import { makeCodePipelinePipelineNameHttpBinding } from "./BindingHttp.js";
import { StopPipelineExecution } from "./StopPipelineExecution.js";
export const StopPipelineExecutionHttp = Layer.effect(StopPipelineExecution, makeCodePipelinePipelineNameHttpBinding({
    tag: "AWS.CodePipeline.StopPipelineExecution",
    operation: codepipeline.stopPipelineExecution,
    actions: ["codepipeline:StopPipelineExecution"],
}));
//# sourceMappingURL=StopPipelineExecutionHttp.js.map