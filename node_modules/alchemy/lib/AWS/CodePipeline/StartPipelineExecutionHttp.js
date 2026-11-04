import * as codepipeline from "@distilled.cloud/aws/codepipeline";
import * as Layer from "effect/Layer";
import { makeCodePipelineNameHttpBinding } from "./BindingHttp.js";
import { StartPipelineExecution } from "./StartPipelineExecution.js";
export const StartPipelineExecutionHttp = Layer.effect(StartPipelineExecution, makeCodePipelineNameHttpBinding({
    tag: "AWS.CodePipeline.StartPipelineExecution",
    operation: codepipeline.startPipelineExecution,
    actions: ["codepipeline:StartPipelineExecution"],
}));
//# sourceMappingURL=StartPipelineExecutionHttp.js.map