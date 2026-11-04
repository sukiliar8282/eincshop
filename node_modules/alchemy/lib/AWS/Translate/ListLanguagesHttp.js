import * as translate from "@distilled.cloud/aws/translate";
import * as Layer from "effect/Layer";
import { makeTranslateHttpBinding } from "./BindingHttp.js";
import { ListLanguages } from "./ListLanguages.js";
export const ListLanguagesHttp = Layer.effect(ListLanguages, makeTranslateHttpBinding({
    tag: "AWS.Translate.ListLanguages",
    operation: translate.listLanguages,
    actions: ["translate:ListLanguages"],
}));
//# sourceMappingURL=ListLanguagesHttp.js.map