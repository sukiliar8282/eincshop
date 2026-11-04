import * as textract from "@distilled.cloud/aws/textract";
import * as Layer from "effect/Layer";
import { makeTextractHttpBinding } from "./BindingHttp.js";
import { GetDocumentTextDetection } from "./GetDocumentTextDetection.js";
export const GetDocumentTextDetectionHttp = Layer.effect(GetDocumentTextDetection, makeTextractHttpBinding({
    capability: "GetDocumentTextDetection",
    // No resource-level IAM for this action.
    iamActions: ["textract:GetDocumentTextDetection"],
    operation: textract.getDocumentTextDetection,
}));
//# sourceMappingURL=GetDocumentTextDetectionHttp.js.map