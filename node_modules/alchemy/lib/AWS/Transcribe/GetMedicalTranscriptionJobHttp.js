import * as transcribe from "@distilled.cloud/aws/transcribe";
import * as Layer from "effect/Layer";
import { makeTranscribeHttpBinding } from "./BindingHttp.js";
import { GetMedicalTranscriptionJob } from "./GetMedicalTranscriptionJob.js";
export const GetMedicalTranscriptionJobHttp = Layer.effect(GetMedicalTranscriptionJob, makeTranscribeHttpBinding({
    tag: "AWS.Transcribe.GetMedicalTranscriptionJob",
    operation: transcribe.getMedicalTranscriptionJob,
    actions: ["transcribe:GetMedicalTranscriptionJob"],
}));
//# sourceMappingURL=GetMedicalTranscriptionJobHttp.js.map