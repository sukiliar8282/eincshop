import * as textract from "@distilled.cloud/aws/textract";
import * as Layer from "effect/Layer";
import { makeTextractHttpBinding } from "./BindingHttp.js";
import { StartDocumentAnalysis } from "./StartDocumentAnalysis.js";
export const StartDocumentAnalysisHttp = Layer.effect(StartDocumentAnalysis, makeTextractHttpBinding({
    capability: "StartDocumentAnalysis",
    // No resource-level IAM for this action.
    iamActions: ["textract:StartDocumentAnalysis"],
    operation: textract.startDocumentAnalysis,
}));
//# sourceMappingURL=StartDocumentAnalysisHttp.js.map