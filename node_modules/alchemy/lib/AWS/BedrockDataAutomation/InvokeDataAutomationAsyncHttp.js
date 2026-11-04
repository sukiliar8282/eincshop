import * as bdar from "@distilled.cloud/aws/bedrock-data-automation-runtime";
import * as Layer from "effect/Layer";
import { makeBdaProjectHttpBinding } from "./BindingHttp.js";
import { InvokeDataAutomationAsync } from "./InvokeDataAutomationAsync.js";
export const InvokeDataAutomationAsyncHttp = Layer.effect(InvokeDataAutomationAsync, makeBdaProjectHttpBinding({
    tag: "AWS.BedrockDataAutomation.InvokeDataAutomationAsync",
    operation: bdar.invokeDataAutomationAsync,
    actions: ["bedrock:InvokeDataAutomationAsync"],
}));
//# sourceMappingURL=InvokeDataAutomationAsyncHttp.js.map