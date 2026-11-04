import * as transcribe from "@distilled.cloud/aws/transcribe";
import * as Layer from "effect/Layer";
import { makeTranscribeHttpBinding } from "./BindingHttp.js";
import { UpdateMedicalVocabulary } from "./UpdateMedicalVocabulary.js";
export const UpdateMedicalVocabularyHttp = Layer.effect(UpdateMedicalVocabulary, makeTranscribeHttpBinding({
    tag: "AWS.Transcribe.UpdateMedicalVocabulary",
    operation: transcribe.updateMedicalVocabulary,
    actions: ["transcribe:UpdateMedicalVocabulary"],
}));
//# sourceMappingURL=UpdateMedicalVocabularyHttp.js.map