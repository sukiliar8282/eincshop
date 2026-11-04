import * as bdar from "@distilled.cloud/aws/bedrock-data-automation-runtime";
import * as Layer from "effect/Layer";
import { makeBdaProjectHttpBinding } from "./BindingHttp.js";
import { InvokeDataAutomation } from "./InvokeDataAutomation.js";
export const InvokeDataAutomationHttp = Layer.effect(InvokeDataAutomation, makeBdaProjectHttpBinding({
    tag: "AWS.BedrockDataAutomation.InvokeDataAutomation",
    operation: bdar.invokeDataAutomation,
    actions: ["bedrock:InvokeDataAutomation"],
}));
//# sourceMappingURL=InvokeDataAutomationHttp.js.map