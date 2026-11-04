import * as transcribe from "@distilled.cloud/aws/transcribe";
import * as Layer from "effect/Layer";
import { makeTranscribeHttpBinding } from "./BindingHttp.js";
import { UpdateVocabularyFilter } from "./UpdateVocabularyFilter.js";
export const UpdateVocabularyFilterHttp = Layer.effect(UpdateVocabularyFilter, makeTranscribeHttpBinding({
    tag: "AWS.Transcribe.UpdateVocabularyFilter",
    operation: transcribe.updateVocabularyFilter,
    actions: ["transcribe:UpdateVocabularyFilter"],
}));
//# sourceMappingURL=UpdateVocabularyFilterHttp.js.map