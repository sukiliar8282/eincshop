import * as agentcore from "@distilled.cloud/aws/bedrock-agentcore";
import * as Layer from "effect/Layer";
import { makeAgentCoreHttpBinding } from "./BindingHttp.js";
import { UpdateBrowserStream } from "./UpdateBrowserStream.js";
export const UpdateBrowserStreamHttp = Layer.effect(UpdateBrowserStream, makeAgentCoreHttpBinding({
    tag: "AWS.BedrockAgentCore.UpdateBrowserStream",
    operation: agentcore.updateBrowserStream,
    actions: ["bedrock-agentcore:UpdateBrowserStream"],
    requestKey: "browserIdentifier",
    identifier: (browser) => browser.browserId,
    arns: (browser) => [browser.browserArn],
}));
//# sourceMappingURL=UpdateBrowserStreamHttp.js.map