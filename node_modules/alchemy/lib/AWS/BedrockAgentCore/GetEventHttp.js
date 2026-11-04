import * as agentcore from "@distilled.cloud/aws/bedrock-agentcore";
import * as Layer from "effect/Layer";
import { makeAgentCoreHttpBinding } from "./BindingHttp.js";
import { GetEvent } from "./GetEvent.js";
export const GetEventHttp = Layer.effect(GetEvent, makeAgentCoreHttpBinding({
    tag: "AWS.BedrockAgentCore.GetEvent",
    operation: agentcore.getEvent,
    actions: ["bedrock-agentcore:GetEvent"],
    requestKey: "memoryId",
    identifier: (memory) => memory.memoryId,
    arns: (memory) => [memory.memoryArn],
}));
//# sourceMappingURL=GetEventHttp.js.map