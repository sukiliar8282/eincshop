import * as agentcore from "@distilled.cloud/aws/bedrock-agentcore";
import * as Layer from "effect/Layer";
import { makeAgentCoreHttpBinding } from "./BindingHttp.js";
import { ListEvents } from "./ListEvents.js";
export const ListEventsHttp = Layer.effect(ListEvents, makeAgentCoreHttpBinding({
    tag: "AWS.BedrockAgentCore.ListEvents",
    operation: agentcore.listEvents,
    actions: ["bedrock-agentcore:ListEvents"],
    requestKey: "memoryId",
    identifier: (memory) => memory.memoryId,
    arns: (memory) => [memory.memoryArn],
}));
//# sourceMappingURL=ListEventsHttp.js.map