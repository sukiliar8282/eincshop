import * as transcribe from "@distilled.cloud/aws/transcribe";
import * as Layer from "effect/Layer";
import { makeTranscribeRoleHttpBinding } from "./BindingHttp.js";
import { StartMedicalScribeJob } from "./StartMedicalScribeJob.js";
export const StartMedicalScribeJobHttp = Layer.effect(StartMedicalScribeJob, makeTranscribeRoleHttpBinding({
    tag: "AWS.Transcribe.StartMedicalScribeJob",
    operation: transcribe.startMedicalScribeJob,
    actions: ["transcribe:StartMedicalScribeJob"],
}));
//# sourceMappingURL=StartMedicalScribeJobHttp.js.map