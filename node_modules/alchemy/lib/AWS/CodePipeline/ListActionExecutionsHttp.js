import * as codepipeline from "@distilled.cloud/aws/codepipeline";
import * as Layer from "effect/Layer";
import { makeCodePipelinePipelineNameHttpBinding } from "./BindingHttp.js";
import { ListActionExecutions } from "./ListActionExecutions.js";
export const ListActionExecutionsHttp = Layer.effect(ListActionExecutions, makeCodePipelinePipelineNameHttpBinding({
    tag: "AWS.CodePipeline.ListActionExecutions",
    operation: codepipeline.listActionExecutions,
    actions: ["codepipeline:ListActionExecutions"],
}));
//# sourceMappingURL=ListActionExecutionsHttp.js.map