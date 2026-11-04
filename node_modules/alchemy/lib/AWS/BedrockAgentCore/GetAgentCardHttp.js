import * as agentcore from "@distilled.cloud/aws/bedrock-agentcore";
import * as Layer from "effect/Layer";
import * as Output from "../../Output.js";
import { makeAgentCoreHttpBinding } from "./BindingHttp.js";
import { GetAgentCard } from "./GetAgentCard.js";
export const GetAgentCardHttp = Layer.effect(GetAgentCard, makeAgentCoreHttpBinding({
    tag: "AWS.BedrockAgentCore.GetAgentCard",
    operation: agentcore.getAgentCard,
    actions: ["bedrock-agentcore:GetAgentCard"],
    requestKey: "agentRuntimeArn",
    identifier: (runtime) => runtime.agentRuntimeArn,
    arns: (runtime) => [
        runtime.agentRuntimeArn,
        // qualified invocations target a runtime endpoint sub-resource.
        Output.interpolate `${runtime.agentRuntimeArn}/runtime-endpoint/*`,
    ],
}));
//# sourceMappingURL=GetAgentCardHttp.js.map