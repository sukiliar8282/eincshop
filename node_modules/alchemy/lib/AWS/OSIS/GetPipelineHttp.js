import * as osis from "@distilled.cloud/aws/osis";
import * as Layer from "effect/Layer";
import { makeOsisPipelineHttpBinding } from "./BindingHttp.js";
import { GetPipeline } from "./GetPipeline.js";
export const GetPipelineHttp = Layer.effect(GetPipeline, makeOsisPipelineHttpBinding({
    tag: "AWS.OSIS.GetPipeline",
    operation: osis.getPipeline,
    actions: ["osis:GetPipeline"],
    requestKey: "PipelineName",
    identifier: (pipeline) => pipeline.pipelineName,
}));
//# sourceMappingURL=GetPipelineHttp.js.map