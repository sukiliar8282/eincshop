import * as textract from "@distilled.cloud/aws/textract";
import * as Layer from "effect/Layer";
import { makeTextractHttpBinding } from "./BindingHttp.js";
import { StartExpenseAnalysis } from "./StartExpenseAnalysis.js";
export const StartExpenseAnalysisHttp = Layer.effect(StartExpenseAnalysis, makeTextractHttpBinding({
    capability: "StartExpenseAnalysis",
    // No resource-level IAM for this action.
    iamActions: ["textract:StartExpenseAnalysis"],
    operation: textract.startExpenseAnalysis,
}));
//# sourceMappingURL=StartExpenseAnalysisHttp.js.map