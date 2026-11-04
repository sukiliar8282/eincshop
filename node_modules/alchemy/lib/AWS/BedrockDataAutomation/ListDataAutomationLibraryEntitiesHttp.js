import * as bda from "@distilled.cloud/aws/bedrock-data-automation";
import * as Layer from "effect/Layer";
import { makeBdaLibraryHttpBinding } from "./BindingHttp.js";
import { ListDataAutomationLibraryEntities } from "./ListDataAutomationLibraryEntities.js";
export const ListDataAutomationLibraryEntitiesHttp = Layer.effect(ListDataAutomationLibraryEntities, makeBdaLibraryHttpBinding({
    tag: "AWS.BedrockDataAutomation.ListDataAutomationLibraryEntities",
    operation: bda.listDataAutomationLibraryEntities,
    actions: ["bedrock:ListDataAutomationLibraryEntities"],
}));
//# sourceMappingURL=ListDataAutomationLibraryEntitiesHttp.js.map