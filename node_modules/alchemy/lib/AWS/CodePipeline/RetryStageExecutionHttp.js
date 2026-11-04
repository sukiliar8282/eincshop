import * as codepipeline from "@distilled.cloud/aws/codepipeline";
import * as Layer from "effect/Layer";
import { makeCodePipelinePipelineNameHttpBinding } from "./BindingHttp.js";
import { RetryStageExecution } from "./RetryStageExecution.js";
export const RetryStageExecutionHttp = Layer.effect(RetryStageExecution, makeCodePipelinePipelineNameHttpBinding({
    tag: "AWS.CodePipeline.RetryStageExecution",
    operation: codepipeline.retryStageExecution,
    actions: ["codepipeline:RetryStageExecution"],
    subScoped: true,
}));
//# sourceMappingURL=RetryStageExecutionHttp.js.map