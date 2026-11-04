import * as agentcore from "@distilled.cloud/aws/bedrock-agentcore";
import * as Layer from "effect/Layer";
import { makeAgentCoreHttpBinding } from "./BindingHttp.js";
import { ListSessions } from "./ListSessions.js";
export const ListSessionsHttp = Layer.effect(ListSessions, makeAgentCoreHttpBinding({
    tag: "AWS.BedrockAgentCore.ListSessions",
    operation: agentcore.listSessions,
    actions: ["bedrock-agentcore:ListSessions"],
    requestKey: "memoryId",
    identifier: (memory) => memory.memoryId,
    arns: (memory) => [memory.memoryArn],
}));
//# sourceMappingURL=ListSessionsHttp.js.map