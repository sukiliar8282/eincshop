import * as agentcore from "@distilled.cloud/aws/bedrock-agentcore";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Binding from "../../Binding.js";
import { toWireSeconds } from "../../Util/Duration.js";
import { isBindingHost } from "../Lambda/Function.js";
import { StartCodeInterpreterSession, } from "./StartCodeInterpreterSession.js";
// Bespoke (not the shared scaffold): converts the ergonomic `sessionTimeout`
// Duration.Input to the wire `sessionTimeoutSeconds` field.
export const StartCodeInterpreterSessionHttp = Layer.effect(StartCodeInterpreterSession, Effect.gen(function* () {
    const startCodeInterpreterSession = yield* agentcore.startCodeInterpreterSession;
    return Effect.fn(function* (codeInterpreter) {
        const Identifier = yield* codeInterpreter.codeInterpreterId;
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            const host = yield* Binding.Host;
            if (isBindingHost(host)) {
                yield* host.bind `Allow(${host}, AWS.BedrockAgentCore.StartCodeInterpreterSession(${codeInterpreter}))`({
                    policyStatements: [
                        {
                            Effect: "Allow",
                            Action: ["bedrock-agentcore:StartCodeInterpreterSession"],
                            Resource: [codeInterpreter.codeInterpreterArn],
                        },
                    ],
                });
            }
        }
        return Effect.fn(`AWS.BedrockAgentCore.StartCodeInterpreterSession(${codeInterpreter.LogicalId})`)(function* ({ sessionTimeout, ...request }) {
            return yield* startCodeInterpreterSession({
                ...request,
                sessionTimeoutSeconds: toWireSeconds(sessionTimeout),
                codeInterpreterIdentifier: yield* Identifier,
            });
        });
    });
}));
//# sourceMappingURL=StartCodeInterpreterSessionHttp.js.map