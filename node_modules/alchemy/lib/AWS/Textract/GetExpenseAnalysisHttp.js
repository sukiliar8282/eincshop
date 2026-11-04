import * as textract from "@distilled.cloud/aws/textract";
import * as Layer from "effect/Layer";
import { makeTextractHttpBinding } from "./BindingHttp.js";
import { GetExpenseAnalysis } from "./GetExpenseAnalysis.js";
export const GetExpenseAnalysisHttp = Layer.effect(GetExpenseAnalysis, makeTextractHttpBinding({
    capability: "GetExpenseAnalysis",
    // No resource-level IAM for this action.
    iamActions: ["textract:GetExpenseAnalysis"],
    operation: textract.getExpenseAnalysis,
}));
//# sourceMappingURL=GetExpenseAnalysisHttp.js.map