import * as agentcore from "@distilled.cloud/aws/bedrock-agentcore";
import * as Layer from "effect/Layer";
import { makeAgentCoreHttpBinding } from "./BindingHttp.js";
import { StartMemoryExtractionJob } from "./StartMemoryExtractionJob.js";
export const StartMemoryExtractionJobHttp = Layer.effect(StartMemoryExtractionJob, makeAgentCoreHttpBinding({
    tag: "AWS.BedrockAgentCore.StartMemoryExtractionJob",
    operation: agentcore.startMemoryExtractionJob,
    actions: ["bedrock-agentcore:StartMemoryExtractionJob"],
    requestKey: "memoryId",
    identifier: (memory) => memory.memoryId,
    arns: (memory) => [memory.memoryArn],
}));
//# sourceMappingURL=StartMemoryExtractionJobHttp.js.map