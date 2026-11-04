import * as translate from "@distilled.cloud/aws/translate";
import * as Layer from "effect/Layer";
import { makeTranslateHttpBinding } from "./BindingHttp.js";
import { ListTextTranslationJobs } from "./ListTextTranslationJobs.js";
export const ListTextTranslationJobsHttp = Layer.effect(ListTextTranslationJobs, makeTranslateHttpBinding({
    tag: "AWS.Translate.ListTextTranslationJobs",
    operation: translate.listTextTranslationJobs,
    actions: ["translate:ListTextTranslationJobs"],
}));
//# sourceMappingURL=ListTextTranslationJobsHttp.js.map