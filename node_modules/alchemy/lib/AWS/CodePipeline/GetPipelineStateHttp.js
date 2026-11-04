import * as codepipeline from "@distilled.cloud/aws/codepipeline";
import * as Layer from "effect/Layer";
import { makeCodePipelineNameHttpBinding } from "./BindingHttp.js";
import { GetPipelineState } from "./GetPipelineState.js";
export const GetPipelineStateHttp = Layer.effect(GetPipelineState, makeCodePipelineNameHttpBinding({
    tag: "AWS.CodePipeline.GetPipelineState",
    operation: codepipeline.getPipelineState,
    actions: ["codepipeline:GetPipelineState"],
}));
//# sourceMappingURL=GetPipelineStateHttp.js.map