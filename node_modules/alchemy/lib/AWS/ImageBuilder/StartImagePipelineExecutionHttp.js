import * as imagebuilder from "@distilled.cloud/aws/imagebuilder";
import * as Layer from "effect/Layer";
import { makeImageBuilderPipelineHttpBinding } from "./BindingHttp.js";
import { StartImagePipelineExecution } from "./StartImagePipelineExecution.js";
export const StartImagePipelineExecutionHttp = Layer.effect(StartImagePipelineExecution, makeImageBuilderPipelineHttpBinding({
    tag: "AWS.ImageBuilder.StartImagePipelineExecution",
    operation: imagebuilder.startImagePipelineExecution,
    actions: ["imagebuilder:StartImagePipelineExecution"],
}));
//# sourceMappingURL=StartImagePipelineExecutionHttp.js.map