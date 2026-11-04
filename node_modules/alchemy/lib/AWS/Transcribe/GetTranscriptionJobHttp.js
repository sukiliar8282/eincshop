import * as transcribe from "@distilled.cloud/aws/transcribe";
import * as Layer from "effect/Layer";
import { makeTranscribeHttpBinding } from "./BindingHttp.js";
import { GetTranscriptionJob } from "./GetTranscriptionJob.js";
export const GetTranscriptionJobHttp = Layer.effect(GetTranscriptionJob, makeTranscribeHttpBinding({
    tag: "AWS.Transcribe.GetTranscriptionJob",
    operation: transcribe.getTranscriptionJob,
    actions: ["transcribe:GetTranscriptionJob"],
}));
//# sourceMappingURL=GetTranscriptionJobHttp.js.map