import * as agentcore from "@distilled.cloud/aws/bedrock-agentcore";
import * as Layer from "effect/Layer";
import { makeAgentCoreHttpBinding } from "./BindingHttp.js";
import { GetCodeInterpreterSession } from "./GetCodeInterpreterSession.js";
export const GetCodeInterpreterSessionHttp = Layer.effect(GetCodeInterpreterSession, makeAgentCoreHttpBinding({
    tag: "AWS.BedrockAgentCore.GetCodeInterpreterSession",
    operation: agentcore.getCodeInterpreterSession,
    actions: ["bedrock-agentcore:GetCodeInterpreterSession"],
    requestKey: "codeInterpreterIdentifier",
    identifier: (codeInterpreter) => codeInterpreter.codeInterpreterId,
    arns: (codeInterpreter) => [
        codeInterpreter.codeInterpreterArn,
    ],
}));
//# sourceMappingURL=GetCodeInterpreterSessionHttp.js.map