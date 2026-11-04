import * as transcribe from "@distilled.cloud/aws/transcribe";
import * as Layer from "effect/Layer";
import { makeTranscribeHttpBinding } from "./BindingHttp.js";
import { GetMedicalScribeJob } from "./GetMedicalScribeJob.js";
export const GetMedicalScribeJobHttp = Layer.effect(GetMedicalScribeJob, makeTranscribeHttpBinding({
    tag: "AWS.Transcribe.GetMedicalScribeJob",
    operation: transcribe.getMedicalScribeJob,
    actions: ["transcribe:GetMedicalScribeJob"],
}));
//# sourceMappingURL=GetMedicalScribeJobHttp.js.map