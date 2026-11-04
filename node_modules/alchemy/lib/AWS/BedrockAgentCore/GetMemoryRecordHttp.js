import * as agentcore from "@distilled.cloud/aws/bedrock-agentcore";
import * as Layer from "effect/Layer";
import { makeAgentCoreHttpBinding } from "./BindingHttp.js";
import { GetMemoryRecord } from "./GetMemoryRecord.js";
export const GetMemoryRecordHttp = Layer.effect(GetMemoryRecord, makeAgentCoreHttpBinding({
    tag: "AWS.BedrockAgentCore.GetMemoryRecord",
    operation: agentcore.getMemoryRecord,
    actions: ["bedrock-agentcore:GetMemoryRecord"],
    requestKey: "memoryId",
    identifier: (memory) => memory.memoryId,
    arns: (memory) => [memory.memoryArn],
}));
//# sourceMappingURL=GetMemoryRecordHttp.js.map