import * as transcribe from "@distilled.cloud/aws/transcribe";
import * as Layer from "effect/Layer";
import { makeTranscribeHttpBinding } from "./BindingHttp.js";
import { ListMedicalVocabularies } from "./ListMedicalVocabularies.js";
export const ListMedicalVocabulariesHttp = Layer.effect(ListMedicalVocabularies, makeTranscribeHttpBinding({
    tag: "AWS.Transcribe.ListMedicalVocabularies",
    operation: transcribe.listMedicalVocabularies,
    actions: ["transcribe:ListMedicalVocabularies"],
}));
//# sourceMappingURL=ListMedicalVocabulariesHttp.js.map