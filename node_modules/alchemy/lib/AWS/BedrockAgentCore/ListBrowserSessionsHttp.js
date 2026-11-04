import * as agentcore from "@distilled.cloud/aws/bedrock-agentcore";
import * as Layer from "effect/Layer";
import { makeAgentCoreHttpBinding } from "./BindingHttp.js";
import { ListBrowserSessions } from "./ListBrowserSessions.js";
export const ListBrowserSessionsHttp = Layer.effect(ListBrowserSessions, makeAgentCoreHttpBinding({
    tag: "AWS.BedrockAgentCore.ListBrowserSessions",
    operation: agentcore.listBrowserSessions,
    actions: ["bedrock-agentcore:ListBrowserSessions"],
    requestKey: "browserIdentifier",
    identifier: (browser) => browser.browserId,
    arns: (browser) => [browser.browserArn],
}));
//# sourceMappingURL=ListBrowserSessionsHttp.js.map