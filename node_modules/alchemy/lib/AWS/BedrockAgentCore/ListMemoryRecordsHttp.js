import * as agentcore from "@distilled.cloud/aws/bedrock-agentcore";
import * as Layer from "effect/Layer";
import { makeAgentCoreHttpBinding } from "./BindingHttp.js";
import { ListMemoryRecords } from "./ListMemoryRecords.js";
export const ListMemoryRecordsHttp = Layer.effect(ListMemoryRecords, makeAgentCoreHttpBinding({
    tag: "AWS.BedrockAgentCore.ListMemoryRecords",
    operation: agentcore.listMemoryRecords,
    actions: ["bedrock-agentcore:ListMemoryRecords"],
    requestKey: "memoryId",
    identifier: (memory) => memory.memoryId,
    arns: (memory) => [memory.memoryArn],
}));
//# sourceMappingURL=ListMemoryRecordsHttp.js.map