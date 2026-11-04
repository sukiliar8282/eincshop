import * as transcribe from "@distilled.cloud/aws/transcribe";
import * as Layer from "effect/Layer";
import { makeTranscribeHttpBinding } from "./BindingHttp.js";
import { UpdateCallAnalyticsCategory } from "./UpdateCallAnalyticsCategory.js";
export const UpdateCallAnalyticsCategoryHttp = Layer.effect(UpdateCallAnalyticsCategory, makeTranscribeHttpBinding({
    tag: "AWS.Transcribe.UpdateCallAnalyticsCategory",
    operation: transcribe.updateCallAnalyticsCategory,
    actions: ["transcribe:UpdateCallAnalyticsCategory"],
}));
//# sourceMappingURL=UpdateCallAnalyticsCategoryHttp.js.map