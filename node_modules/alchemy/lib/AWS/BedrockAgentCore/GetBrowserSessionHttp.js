import * as agentcore from "@distilled.cloud/aws/bedrock-agentcore";
import * as Layer from "effect/Layer";
import { makeAgentCoreHttpBinding } from "./BindingHttp.js";
import { GetBrowserSession } from "./GetBrowserSession.js";
export const GetBrowserSessionHttp = Layer.effect(GetBrowserSession, makeAgentCoreHttpBinding({
    tag: "AWS.BedrockAgentCore.GetBrowserSession",
    operation: agentcore.getBrowserSession,
    actions: ["bedrock-agentcore:GetBrowserSession"],
    requestKey: "browserIdentifier",
    identifier: (browser) => browser.browserId,
    arns: (browser) => [browser.browserArn],
}));
//# sourceMappingURL=GetBrowserSessionHttp.js.map