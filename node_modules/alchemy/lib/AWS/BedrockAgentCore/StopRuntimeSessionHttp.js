import * as agentcore from "@distilled.cloud/aws/bedrock-agentcore";
import * as Layer from "effect/Layer";
import * as Output from "../../Output.js";
import { makeAgentCoreHttpBinding } from "./BindingHttp.js";
import { StopRuntimeSession } from "./StopRuntimeSession.js";
export const StopRuntimeSessionHttp = Layer.effect(StopRuntimeSession, makeAgentCoreHttpBinding({
    tag: "AWS.BedrockAgentCore.StopRuntimeSession",
    operation: agentcore.stopRuntimeSession,
    actions: ["bedrock-agentcore:StopRuntimeSession"],
    requestKey: "agentRuntimeArn",
    identifier: (runtime) => runtime.agentRuntimeArn,
    arns: (runtime) => [
        runtime.agentRuntimeArn,
        // qualified invocations target a runtime endpoint sub-resource.
        Output.interpolate `${runtime.agentRuntimeArn}/runtime-endpoint/*`,
    ],
}));
//# sourceMappingURL=StopRuntimeSessionHttp.js.map