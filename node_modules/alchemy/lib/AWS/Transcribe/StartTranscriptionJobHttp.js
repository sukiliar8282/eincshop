import * as transcribe from "@distilled.cloud/aws/transcribe";
import * as Layer from "effect/Layer";
import { makeTranscribeHttpBinding } from "./BindingHttp.js";
import { StartTranscriptionJob } from "./StartTranscriptionJob.js";
export const StartTranscriptionJobHttp = Layer.effect(StartTranscriptionJob, makeTranscribeHttpBinding({
    tag: "AWS.Transcribe.StartTranscriptionJob",
    operation: transcribe.startTranscriptionJob,
    actions: ["transcribe:StartTranscriptionJob"],
}));
//# sourceMappingURL=StartTranscriptionJobHttp.js.map