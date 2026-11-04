import * as transcribe from "@distilled.cloud/aws/transcribe";
import * as Layer from "effect/Layer";
import { makeTranscribeHttpBinding } from "./BindingHttp.js";
import { ListVocabularies } from "./ListVocabularies.js";
export const ListVocabulariesHttp = Layer.effect(ListVocabularies, makeTranscribeHttpBinding({
    tag: "AWS.Transcribe.ListVocabularies",
    operation: transcribe.listVocabularies,
    actions: ["transcribe:ListVocabularies"],
}));
//# sourceMappingURL=ListVocabulariesHttp.js.map