import * as osis from "@distilled.cloud/aws/osis";
import * as Layer from "effect/Layer";
import { makeOsisPipelineHttpBinding } from "./BindingHttp.js";
import { StartPipeline } from "./StartPipeline.js";
export const StartPipelineHttp = Layer.effect(StartPipeline, makeOsisPipelineHttpBinding({
    tag: "AWS.OSIS.StartPipeline",
    operation: osis.startPipeline,
    actions: ["osis:StartPipeline"],
    requestKey: "PipelineName",
    identifier: (pipeline) => pipeline.pipelineName,
}));
//# sourceMappingURL=StartPipelineHttp.js.map