import * as transcribe from "@distilled.cloud/aws/transcribe";
import * as Layer from "effect/Layer";
import { makeTranscribeHttpBinding } from "./BindingHttp.js";
import { UpdateVocabulary } from "./UpdateVocabulary.js";
export const UpdateVocabularyHttp = Layer.effect(UpdateVocabulary, makeTranscribeHttpBinding({
    tag: "AWS.Transcribe.UpdateVocabulary",
    operation: transcribe.updateVocabulary,
    actions: ["transcribe:UpdateVocabulary"],
}));
//# sourceMappingURL=UpdateVocabularyHttp.js.map