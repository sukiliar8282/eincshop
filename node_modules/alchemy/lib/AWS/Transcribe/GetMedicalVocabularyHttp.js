import * as transcribe from "@distilled.cloud/aws/transcribe";
import * as Layer from "effect/Layer";
import { makeTranscribeHttpBinding } from "./BindingHttp.js";
import { GetMedicalVocabulary } from "./GetMedicalVocabulary.js";
export const GetMedicalVocabularyHttp = Layer.effect(GetMedicalVocabulary, makeTranscribeHttpBinding({
    tag: "AWS.Transcribe.GetMedicalVocabulary",
    operation: transcribe.getMedicalVocabulary,
    actions: ["transcribe:GetMedicalVocabulary"],
}));
//# sourceMappingURL=GetMedicalVocabularyHttp.js.map