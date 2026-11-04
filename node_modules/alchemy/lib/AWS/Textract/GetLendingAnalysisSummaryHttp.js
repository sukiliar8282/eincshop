import * as textract from "@distilled.cloud/aws/textract";
import * as Layer from "effect/Layer";
import { makeTextractHttpBinding } from "./BindingHttp.js";
import { GetLendingAnalysisSummary } from "./GetLendingAnalysisSummary.js";
export const GetLendingAnalysisSummaryHttp = Layer.effect(GetLendingAnalysisSummary, makeTextractHttpBinding({
    capability: "GetLendingAnalysisSummary",
    // No resource-level IAM for this action.
    iamActions: ["textract:GetLendingAnalysisSummary"],
    operation: textract.getLendingAnalysisSummary,
}));
//# sourceMappingURL=GetLendingAnalysisSummaryHttp.js.map