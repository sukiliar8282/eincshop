import * as textract from "@distilled.cloud/aws/textract";
import * as Layer from "effect/Layer";
import { makeTextractHttpBinding } from "./BindingHttp.js";
import { DetectDocumentText } from "./DetectDocumentText.js";
export const DetectDocumentTextHttp = Layer.effect(DetectDocumentText, makeTextractHttpBinding({
    capability: "DetectDocumentText",
    // textract:DetectDocumentText has no resource-level IAM.
    iamActions: ["textract:DetectDocumentText"],
    operation: textract.detectDocumentText,
}));
//# sourceMappingURL=DetectDocumentTextHttp.js.map