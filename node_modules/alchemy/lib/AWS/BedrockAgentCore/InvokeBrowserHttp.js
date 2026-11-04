import * as agentcore from "@distilled.cloud/aws/bedrock-agentcore";
import * as Layer from "effect/Layer";
import { makeAgentCoreHttpBinding } from "./BindingHttp.js";
import { InvokeBrowser } from "./InvokeBrowser.js";
export const InvokeBrowserHttp = Layer.effect(InvokeBrowser, makeAgentCoreHttpBinding({
    tag: "AWS.BedrockAgentCore.InvokeBrowser",
    operation: agentcore.invokeBrowser,
    actions: ["bedrock-agentcore:InvokeBrowser"],
    requestKey: "browserIdentifier",
    identifier: (browser) => browser.browserId,
    arns: (browser) => [browser.browserArn],
}));
//# sourceMappingURL=InvokeBrowserHttp.js.map