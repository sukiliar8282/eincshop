import * as codepipeline from "@distilled.cloud/aws/codepipeline";
import * as Layer from "effect/Layer";
import { makeCodePipelinePipelineNameHttpBinding } from "./BindingHttp.js";
import { ListRuleExecutions } from "./ListRuleExecutions.js";
export const ListRuleExecutionsHttp = Layer.effect(ListRuleExecutions, makeCodePipelinePipelineNameHttpBinding({
    tag: "AWS.CodePipeline.ListRuleExecutions",
    operation: codepipeline.listRuleExecutions,
    actions: ["codepipeline:ListRuleExecutions"],
}));
//# sourceMappingURL=ListRuleExecutionsHttp.js.map