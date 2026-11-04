import * as agentcore from "@distilled.cloud/aws/bedrock-agentcore";
import * as Layer from "effect/Layer";
import * as Output from "../../Output.js";
import { makeAgentCoreHttpBinding } from "./BindingHttp.js";
import { InvokeAgentRuntimeCommand } from "./InvokeAgentRuntimeCommand.js";
export const InvokeAgentRuntimeCommandHttp = Layer.effect(InvokeAgentRuntimeCommand, makeAgentCoreHttpBinding({
    tag: "AWS.BedrockAgentCore.InvokeAgentRuntimeCommand",
    operation: agentcore.invokeAgentRuntimeCommand,
    actions: ["bedrock-agentcore:InvokeAgentRuntimeCommand"],
    requestKey: "agentRuntimeArn",
    identifier: (runtime) => runtime.agentRuntimeArn,
    arns: (runtime) => [
        runtime.agentRuntimeArn,
        // qualified invocations target a runtime endpoint sub-resource.
        Output.interpolate `${runtime.agentRuntimeArn}/runtime-endpoint/*`,
    ],
}));
//# sourceMappingURL=InvokeAgentRuntimeCommandHttp.js.map