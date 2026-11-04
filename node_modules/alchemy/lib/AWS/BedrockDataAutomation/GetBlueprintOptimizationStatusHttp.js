import * as bda from "@distilled.cloud/aws/bedrock-data-automation";
import * as Layer from "effect/Layer";
import { makeBdaAccountHttpBinding } from "./BindingHttp.js";
import { GetBlueprintOptimizationStatus } from "./GetBlueprintOptimizationStatus.js";
export const GetBlueprintOptimizationStatusHttp = Layer.effect(GetBlueprintOptimizationStatus, makeBdaAccountHttpBinding({
    tag: "AWS.BedrockDataAutomation.GetBlueprintOptimizationStatus",
    operation: bda.getBlueprintOptimizationStatus,
    actions: ["bedrock:GetBlueprintOptimizationStatus"],
}));
//# sourceMappingURL=GetBlueprintOptimizationStatusHttp.js.map