import * as textract from "@distilled.cloud/aws/textract";
import * as Layer from "effect/Layer";
import { makeTextractHttpBinding } from "./BindingHttp.js";
import { StartDocumentTextDetection } from "./StartDocumentTextDetection.js";
export const StartDocumentTextDetectionHttp = Layer.effect(StartDocumentTextDetection, makeTextractHttpBinding({
    capability: "StartDocumentTextDetection",
    // No resource-level IAM for this action.
    iamActions: ["textract:StartDocumentTextDetection"],
    operation: textract.startDocumentTextDetection,
}));
//# sourceMappingURL=StartDocumentTextDetectionHttp.js.map