import * as agentcore from "@distilled.cloud/aws/bedrock-agentcore";
import * as Layer from "effect/Layer";
import { makeAgentCoreHttpBinding } from "./BindingHttp.js";
import { RetrieveMemoryRecords } from "./RetrieveMemoryRecords.js";
export const RetrieveMemoryRecordsHttp = Layer.effect(RetrieveMemoryRecords, makeAgentCoreHttpBinding({
    tag: "AWS.BedrockAgentCore.RetrieveMemoryRecords",
    operation: agentcore.retrieveMemoryRecords,
    actions: ["bedrock-agentcore:RetrieveMemoryRecords"],
    requestKey: "memoryId",
    identifier: (memory) => memory.memoryId,
    arns: (memory) => [memory.memoryArn],
}));
//# sourceMappingURL=RetrieveMemoryRecordsHttp.js.map