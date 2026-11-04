import * as codepipeline from "@distilled.cloud/aws/codepipeline";
import * as Layer from "effect/Layer";
import { makeCodePipelinePipelineNameHttpBinding } from "./BindingHttp.js";
import { PutActionRevision } from "./PutActionRevision.js";
export const PutActionRevisionHttp = Layer.effect(PutActionRevision, makeCodePipelinePipelineNameHttpBinding({
    tag: "AWS.CodePipeline.PutActionRevision",
    operation: codepipeline.putActionRevision,
    actions: ["codepipeline:PutActionRevision"],
    subScoped: true,
}));
//# sourceMappingURL=PutActionRevisionHttp.js.map