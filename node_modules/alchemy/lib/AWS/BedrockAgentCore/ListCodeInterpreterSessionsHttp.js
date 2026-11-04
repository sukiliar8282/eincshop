import * as agentcore from "@distilled.cloud/aws/bedrock-agentcore";
import * as Layer from "effect/Layer";
import { makeAgentCoreHttpBinding } from "./BindingHttp.js";
import { ListCodeInterpreterSessions } from "./ListCodeInterpreterSessions.js";
export const ListCodeInterpreterSessionsHttp = Layer.effect(ListCodeInterpreterSessions, makeAgentCoreHttpBinding({
    tag: "AWS.BedrockAgentCore.ListCodeInterpreterSessions",
    operation: agentcore.listCodeInterpreterSessions,
    actions: ["bedrock-agentcore:ListCodeInterpreterSessions"],
    requestKey: "codeInterpreterIdentifier",
    identifier: (codeInterpreter) => codeInterpreter.codeInterpreterId,
    arns: (codeInterpreter) => [
        codeInterpreter.codeInterpreterArn,
    ],
}));
//# sourceMappingURL=ListCodeInterpreterSessionsHttp.js.map