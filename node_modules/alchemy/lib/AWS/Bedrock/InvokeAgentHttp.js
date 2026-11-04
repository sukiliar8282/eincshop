import * as bedrock from "@distilled.cloud/aws/bedrock-agent-runtime";
import * as Layer from "effect/Layer";
import { makeAgentAliasScopedHttpBinding } from "./BindingHttp.js";
import { InvokeAgent } from "./InvokeAgent.js";
export const InvokeAgentHttp = Layer.effect(InvokeAgent, makeAgentAliasScopedHttpBinding({
    tag: "AWS.Bedrock.InvokeAgent",
    operation: bedrock.invokeAgent,
    actions: ["bedrock:InvokeAgent"],
}));
//# sourceMappingURL=InvokeAgentHttp.js.map