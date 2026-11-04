import * as agentcore from "@distilled.cloud/aws/bedrock-agentcore";
import * as Layer from "effect/Layer";
import { makeAgentCoreHttpBinding } from "./BindingHttp.js";
import { ListActors } from "./ListActors.js";
export const ListActorsHttp = Layer.effect(ListActors, makeAgentCoreHttpBinding({
    tag: "AWS.BedrockAgentCore.ListActors",
    operation: agentcore.listActors,
    actions: ["bedrock-agentcore:ListActors"],
    requestKey: "memoryId",
    identifier: (memory) => memory.memoryId,
    arns: (memory) => [memory.memoryArn],
}));
//# sourceMappingURL=ListActorsHttp.js.map