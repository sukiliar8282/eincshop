import * as transcribe from "@distilled.cloud/aws/transcribe";
import * as Layer from "effect/Layer";
import { makeTranscribeRoleHttpBinding } from "./BindingHttp.js";
import { StartCallAnalyticsJob } from "./StartCallAnalyticsJob.js";
export const StartCallAnalyticsJobHttp = Layer.effect(StartCallAnalyticsJob, makeTranscribeRoleHttpBinding({
    tag: "AWS.Transcribe.StartCallAnalyticsJob",
    operation: transcribe.startCallAnalyticsJob,
    actions: ["transcribe:StartCallAnalyticsJob"],
}));
//# sourceMappingURL=StartCallAnalyticsJobHttp.js.map