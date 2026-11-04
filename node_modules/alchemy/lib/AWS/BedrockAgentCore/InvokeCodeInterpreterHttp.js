import * as agentcore from "@distilled.cloud/aws/bedrock-agentcore";
import * as Layer from "effect/Layer";
import { makeAgentCoreHttpBinding } from "./BindingHttp.js";
import { InvokeCodeInterpreter } from "./InvokeCodeInterpreter.js";
export const InvokeCodeInterpreterHttp = Layer.effect(InvokeCodeInterpreter, makeAgentCoreHttpBinding({
    tag: "AWS.BedrockAgentCore.InvokeCodeInterpreter",
    operation: agentcore.invokeCodeInterpreter,
    actions: ["bedrock-agentcore:InvokeCodeInterpreter"],
    requestKey: "codeInterpreterIdentifier",
    identifier: (codeInterpreter) => codeInterpreter.codeInterpreterId,
    arns: (codeInterpreter) => [
        codeInterpreter.codeInterpreterArn,
    ],
}));
//# sourceMappingURL=InvokeCodeInterpreterHttp.js.map