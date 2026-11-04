import * as transcribe from "@distilled.cloud/aws/transcribe";
import * as Layer from "effect/Layer";
import { makeTranscribeHttpBinding } from "./BindingHttp.js";
import { GetVocabularyFilter } from "./GetVocabularyFilter.js";
export const GetVocabularyFilterHttp = Layer.effect(GetVocabularyFilter, makeTranscribeHttpBinding({
    tag: "AWS.Transcribe.GetVocabularyFilter",
    operation: transcribe.getVocabularyFilter,
    actions: ["transcribe:GetVocabularyFilter"],
}));
//# sourceMappingURL=GetVocabularyFilterHttp.js.map