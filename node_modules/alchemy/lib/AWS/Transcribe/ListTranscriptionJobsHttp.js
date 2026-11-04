import * as transcribe from "@distilled.cloud/aws/transcribe";
import * as Layer from "effect/Layer";
import { makeTranscribeHttpBinding } from "./BindingHttp.js";
import { ListTranscriptionJobs } from "./ListTranscriptionJobs.js";
export const ListTranscriptionJobsHttp = Layer.effect(ListTranscriptionJobs, makeTranscribeHttpBinding({
    tag: "AWS.Transcribe.ListTranscriptionJobs",
    operation: transcribe.listTranscriptionJobs,
    actions: ["transcribe:ListTranscriptionJobs"],
}));
//# sourceMappingURL=ListTranscriptionJobsHttp.js.map