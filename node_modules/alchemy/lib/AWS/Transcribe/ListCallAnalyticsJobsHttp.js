import * as transcribe from "@distilled.cloud/aws/transcribe";
import * as Layer from "effect/Layer";
import { makeTranscribeHttpBinding } from "./BindingHttp.js";
import { ListCallAnalyticsJobs } from "./ListCallAnalyticsJobs.js";
export const ListCallAnalyticsJobsHttp = Layer.effect(ListCallAnalyticsJobs, makeTranscribeHttpBinding({
    tag: "AWS.Transcribe.ListCallAnalyticsJobs",
    operation: transcribe.listCallAnalyticsJobs,
    actions: ["transcribe:ListCallAnalyticsJobs"],
}));
//# sourceMappingURL=ListCallAnalyticsJobsHttp.js.map