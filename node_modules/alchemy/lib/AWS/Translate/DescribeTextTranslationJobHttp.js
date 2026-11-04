import * as translate from "@distilled.cloud/aws/translate";
import * as Layer from "effect/Layer";
import { makeTranslateHttpBinding } from "./BindingHttp.js";
import { DescribeTextTranslationJob } from "./DescribeTextTranslationJob.js";
export const DescribeTextTranslationJobHttp = Layer.effect(DescribeTextTranslationJob, makeTranslateHttpBinding({
    tag: "AWS.Translate.DescribeTextTranslationJob",
    operation: translate.describeTextTranslationJob,
    actions: ["translate:DescribeTextTranslationJob"],
}));
//# sourceMappingURL=DescribeTextTranslationJobHttp.js.map