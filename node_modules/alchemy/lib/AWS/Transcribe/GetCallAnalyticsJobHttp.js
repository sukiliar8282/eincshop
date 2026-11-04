import * as transcribe from "@distilled.cloud/aws/transcribe";
import * as Layer from "effect/Layer";
import { makeTranscribeHttpBinding } from "./BindingHttp.js";
import { GetCallAnalyticsJob } from "./GetCallAnalyticsJob.js";
export const GetCallAnalyticsJobHttp = Layer.effect(GetCallAnalyticsJob, makeTranscribeHttpBinding({
    tag: "AWS.Transcribe.GetCallAnalyticsJob",
    operation: transcribe.getCallAnalyticsJob,
    actions: ["transcribe:GetCallAnalyticsJob"],
}));
//# sourceMappingURL=GetCallAnalyticsJobHttp.js.map