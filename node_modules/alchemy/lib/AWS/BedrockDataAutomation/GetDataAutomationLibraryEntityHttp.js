import * as bda from "@distilled.cloud/aws/bedrock-data-automation";
import * as Layer from "effect/Layer";
import { makeBdaLibraryHttpBinding } from "./BindingHttp.js";
import { GetDataAutomationLibraryEntity } from "./GetDataAutomationLibraryEntity.js";
export const GetDataAutomationLibraryEntityHttp = Layer.effect(GetDataAutomationLibraryEntity, makeBdaLibraryHttpBinding({
    tag: "AWS.BedrockDataAutomation.GetDataAutomationLibraryEntity",
    operation: bda.getDataAutomationLibraryEntity,
    actions: ["bedrock:GetDataAutomationLibraryEntity"],
}));
//# sourceMappingURL=GetDataAutomationLibraryEntityHttp.js.map