import * as agentcore from "@distilled.cloud/aws/bedrock-agentcore";
import * as Layer from "effect/Layer";
import * as Output from "../../Output.js";
import { makeAgentCoreHttpBinding } from "./BindingHttp.js";
import { InvokeAgentRuntime } from "./InvokeAgentRuntime.js";
export const InvokeAgentRuntimeHttp = Layer.effect(InvokeAgentRuntime, makeAgentCoreHttpBinding({
    tag: "AWS.BedrockAgentCore.InvokeAgentRuntime",
    operation: agentcore.invokeAgentRuntime,
    actions: ["bedrock-agentcore:InvokeAgentRuntime"],
    requestKey: "agentRuntimeArn",
    identifier: (runtime) => runtime.agentRuntimeArn,
    arns: (runtime) => [
        runtime.agentRuntimeArn,
        // qualified invocations target a runtime endpoint sub-resource.
        Output.interpolate `${runtime.agentRuntimeArn}/runtime-endpoint/*`,
    ],
}));
//# sourceMappingURL=InvokeAgentRuntimeHttp.js.map