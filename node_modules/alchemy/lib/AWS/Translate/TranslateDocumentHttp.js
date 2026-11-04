import * as translate from "@distilled.cloud/aws/translate";
import * as Layer from "effect/Layer";
import { makeTranslateHttpBinding } from "./BindingHttp.js";
import { TranslateDocument } from "./TranslateDocument.js";
export const TranslateDocumentHttp = Layer.effect(TranslateDocument, makeTranslateHttpBinding({
    tag: "AWS.Translate.TranslateDocument",
    operation: translate.translateDocument,
    actions: ["translate:TranslateDocument"],
}));
//# sourceMappingURL=TranslateDocumentHttp.js.map