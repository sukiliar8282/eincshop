import * as transcribe from "@distilled.cloud/aws/transcribe";
import * as Layer from "effect/Layer";
import { makeTranscribeHttpBinding } from "./BindingHttp.js";
import { GetVocabulary } from "./GetVocabulary.js";
export const GetVocabularyHttp = Layer.effect(GetVocabulary, makeTranscribeHttpBinding({
    tag: "AWS.Transcribe.GetVocabulary",
    operation: transcribe.getVocabulary,
    actions: ["transcribe:GetVocabulary"],
}));
//# sourceMappingURL=GetVocabularyHttp.js.map