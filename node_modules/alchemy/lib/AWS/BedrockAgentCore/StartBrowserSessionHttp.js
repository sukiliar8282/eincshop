import * as agentcore from "@distilled.cloud/aws/bedrock-agentcore";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Binding from "../../Binding.js";
import { toWireSeconds } from "../../Util/Duration.js";
import { isBindingHost } from "../Lambda/Function.js";
import { StartBrowserSession, } from "./StartBrowserSession.js";
// Bespoke (not the shared scaffold): converts the ergonomic `sessionTimeout`
// Duration.Input to the wire `sessionTimeoutSeconds` field.
export const StartBrowserSessionHttp = Layer.effect(StartBrowserSession, Effect.gen(function* () {
    const startBrowserSession = yield* agentcore.startBrowserSession;
    return Effect.fn(function* (browser) {
        const Identifier = yield* browser.browserId;
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            const host = yield* Binding.Host;
            if (isBindingHost(host)) {
                yield* host.bind `Allow(${host}, AWS.BedrockAgentCore.StartBrowserSession(${browser}))`({
                    policyStatements: [
                        {
                            Effect: "Allow",
                            Action: ["bedrock-agentcore:StartBrowserSession"],
                            Resource: [browser.browserArn],
                        },
                    ],
                });
            }
        }
        return Effect.fn(`AWS.BedrockAgentCore.StartBrowserSession(${browser.LogicalId})`)(function* ({ sessionTimeout, ...request }) {
            return yield* startBrowserSession({
                ...request,
                sessionTimeoutSeconds: toWireSeconds(sessionTimeout),
                browserIdentifier: yield* Identifier,
            });
        });
    });
}));
//# sourceMappingURL=StartBrowserSessionHttp.js.map