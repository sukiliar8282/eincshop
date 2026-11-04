import * as transcribe from "@distilled.cloud/aws/transcribe";
import * as Layer from "effect/Layer";
import { makeTranscribeHttpBinding } from "./BindingHttp.js";
import { GetCallAnalyticsCategory } from "./GetCallAnalyticsCategory.js";
export const GetCallAnalyticsCategoryHttp = Layer.effect(GetCallAnalyticsCategory, makeTranscribeHttpBinding({
    tag: "AWS.Transcribe.GetCallAnalyticsCategory",
    operation: transcribe.getCallAnalyticsCategory,
    actions: ["transcribe:GetCallAnalyticsCategory"],
}));
//# sourceMappingURL=GetCallAnalyticsCategoryHttp.js.map