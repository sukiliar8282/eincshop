import * as agentcore from "@distilled.cloud/aws/bedrock-agentcore";
import * as Layer from "effect/Layer";
import { makeAgentCoreHttpBinding } from "./BindingHttp.js";
import { StopCodeInterpreterSession } from "./StopCodeInterpreterSession.js";
export const StopCodeInterpreterSessionHttp = Layer.effect(StopCodeInterpreterSession, makeAgentCoreHttpBinding({
    tag: "AWS.BedrockAgentCore.StopCodeInterpreterSession",
    operation: agentcore.stopCodeInterpreterSession,
    actions: ["bedrock-agentcore:StopCodeInterpreterSession"],
    requestKey: "codeInterpreterIdentifier",
    identifier: (codeInterpreter) => codeInterpreter.codeInterpreterId,
    arns: (codeInterpreter) => [
        codeInterpreter.codeInterpreterArn,
    ],
}));
//# sourceMappingURL=StopCodeInterpreterSessionHttp.js.map