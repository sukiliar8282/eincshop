import * as agentcore from "@distilled.cloud/aws/bedrock-agentcore";
import * as Layer from "effect/Layer";
import { makeAgentCoreHttpBinding } from "./BindingHttp.js";
import { StopBrowserSession } from "./StopBrowserSession.js";
export const StopBrowserSessionHttp = Layer.effect(StopBrowserSession, makeAgentCoreHttpBinding({
    tag: "AWS.BedrockAgentCore.StopBrowserSession",
    operation: agentcore.stopBrowserSession,
    actions: ["bedrock-agentcore:StopBrowserSession"],
    requestKey: "browserIdentifier",
    identifier: (browser) => browser.browserId,
    arns: (browser) => [browser.browserArn],
}));
//# sourceMappingURL=StopBrowserSessionHttp.js.map