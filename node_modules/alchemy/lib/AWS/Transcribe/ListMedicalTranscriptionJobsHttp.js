import * as transcribe from "@distilled.cloud/aws/transcribe";
import * as Layer from "effect/Layer";
import { makeTranscribeHttpBinding } from "./BindingHttp.js";
import { ListMedicalTranscriptionJobs } from "./ListMedicalTranscriptionJobs.js";
export const ListMedicalTranscriptionJobsHttp = Layer.effect(ListMedicalTranscriptionJobs, makeTranscribeHttpBinding({
    tag: "AWS.Transcribe.ListMedicalTranscriptionJobs",
    operation: transcribe.listMedicalTranscriptionJobs,
    actions: ["transcribe:ListMedicalTranscriptionJobs"],
}));
//# sourceMappingURL=ListMedicalTranscriptionJobsHttp.js.map