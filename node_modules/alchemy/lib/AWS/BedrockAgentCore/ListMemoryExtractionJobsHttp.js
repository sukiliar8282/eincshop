import * as agentcore from "@distilled.cloud/aws/bedrock-agentcore";
import * as Layer from "effect/Layer";
import { makeAgentCoreHttpBinding } from "./BindingHttp.js";
import { ListMemoryExtractionJobs } from "./ListMemoryExtractionJobs.js";
export const ListMemoryExtractionJobsHttp = Layer.effect(ListMemoryExtractionJobs, makeAgentCoreHttpBinding({
    tag: "AWS.BedrockAgentCore.ListMemoryExtractionJobs",
    operation: agentcore.listMemoryExtractionJobs,
    actions: ["bedrock-agentcore:ListMemoryExtractionJobs"],
    requestKey: "memoryId",
    identifier: (memory) => memory.memoryId,
    arns: (memory) => [memory.memoryArn],
}));
//# sourceMappingURL=ListMemoryExtractionJobsHttp.js.map