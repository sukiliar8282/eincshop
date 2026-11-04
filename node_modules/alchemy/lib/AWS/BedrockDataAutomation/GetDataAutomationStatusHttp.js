import * as bdar from "@distilled.cloud/aws/bedrock-data-automation-runtime";
import * as Layer from "effect/Layer";
import { makeBdaAccountHttpBinding } from "./BindingHttp.js";
import { GetDataAutomationStatus } from "./GetDataAutomationStatus.js";
export const GetDataAutomationStatusHttp = Layer.effect(GetDataAutomationStatus, makeBdaAccountHttpBinding({
    tag: "AWS.BedrockDataAutomation.GetDataAutomationStatus",
    operation: bdar.getDataAutomationStatus,
    actions: ["bedrock:GetDataAutomationStatus"],
}));
//# sourceMappingURL=GetDataAutomationStatusHttp.js.map