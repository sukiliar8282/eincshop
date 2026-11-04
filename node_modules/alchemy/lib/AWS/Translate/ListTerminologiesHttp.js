import * as translate from "@distilled.cloud/aws/translate";
import * as Layer from "effect/Layer";
import { makeTranslateHttpBinding } from "./BindingHttp.js";
import { ListTerminologies } from "./ListTerminologies.js";
export const ListTerminologiesHttp = Layer.effect(ListTerminologies, makeTranslateHttpBinding({
    tag: "AWS.Translate.ListTerminologies",
    operation: translate.listTerminologies,
    actions: ["translate:ListTerminologies"],
}));
//# sourceMappingURL=ListTerminologiesHttp.js.map