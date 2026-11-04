import * as transcribe from "@distilled.cloud/aws/transcribe";
import * as Layer from "effect/Layer";
import { makeTranscribeHttpBinding } from "./BindingHttp.js";
import { ListVocabularyFilters } from "./ListVocabularyFilters.js";
export const ListVocabularyFiltersHttp = Layer.effect(ListVocabularyFilters, makeTranscribeHttpBinding({
    tag: "AWS.Transcribe.ListVocabularyFilters",
    operation: transcribe.listVocabularyFilters,
    actions: ["transcribe:ListVocabularyFilters"],
}));
//# sourceMappingURL=ListVocabularyFiltersHttp.js.map