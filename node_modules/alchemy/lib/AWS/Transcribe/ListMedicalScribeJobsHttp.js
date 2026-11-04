import * as transcribe from "@distilled.cloud/aws/transcribe";
import * as Layer from "effect/Layer";
import { makeTranscribeHttpBinding } from "./BindingHttp.js";
import { ListMedicalScribeJobs } from "./ListMedicalScribeJobs.js";
export const ListMedicalScribeJobsHttp = Layer.effect(ListMedicalScribeJobs, makeTranscribeHttpBinding({
    tag: "AWS.Transcribe.ListMedicalScribeJobs",
    operation: transcribe.listMedicalScribeJobs,
    actions: ["transcribe:ListMedicalScribeJobs"],
}));
//# sourceMappingURL=ListMedicalScribeJobsHttp.js.map