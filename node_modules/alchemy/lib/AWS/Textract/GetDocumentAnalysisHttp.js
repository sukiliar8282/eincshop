import * as textract from "@distilled.cloud/aws/textract";
import * as Layer from "effect/Layer";
import { makeTextractHttpBinding } from "./BindingHttp.js";
import { GetDocumentAnalysis } from "./GetDocumentAnalysis.js";
export const GetDocumentAnalysisHttp = Layer.effect(GetDocumentAnalysis, makeTextractHttpBinding({
    capability: "GetDocumentAnalysis",
    // No resource-level IAM for this action.
    iamActions: ["textract:GetDocumentAnalysis"],
    operation: textract.getDocumentAnalysis,
}));
//# sourceMappingURL=GetDocumentAnalysisHttp.js.map