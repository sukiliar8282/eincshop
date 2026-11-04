import * as agentcore from "@distilled.cloud/aws/bedrock-agentcore";
import * as Layer from "effect/Layer";
import { makeAgentCoreHttpBinding } from "./BindingHttp.js";
import { SaveBrowserSessionProfile } from "./SaveBrowserSessionProfile.js";
export const SaveBrowserSessionProfileHttp = Layer.effect(SaveBrowserSessionProfile, makeAgentCoreHttpBinding({
    tag: "AWS.BedrockAgentCore.SaveBrowserSessionProfile",
    operation: agentcore.saveBrowserSessionProfile,
    actions: ["bedrock-agentcore:SaveBrowserSessionProfile"],
    requestKey: "browserIdentifier",
    identifier: (browser) => browser.browserId,
    arns: (browser) => [browser.browserArn],
}));
//# sourceMappingURL=SaveBrowserSessionProfileHttp.js.map