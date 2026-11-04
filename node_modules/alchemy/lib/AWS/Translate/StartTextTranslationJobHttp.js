import * as translate from "@distilled.cloud/aws/translate";
import * as Layer from "effect/Layer";
import { makeTranslateStartJobHttpBinding } from "./BindingHttp.js";
import { StartTextTranslationJob } from "./StartTextTranslationJob.js";
export const StartTextTranslationJobHttp = Layer.effect(StartTextTranslationJob, makeTranslateStartJobHttpBinding({
    tag: "AWS.Translate.StartTextTranslationJob",
    operation: translate.startTextTranslationJob,
    actions: ["translate:StartTextTranslationJob"],
}));
//# sourceMappingURL=StartTextTranslationJobHttp.js.map