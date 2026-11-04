import * as kendra from "@distilled.cloud/aws/kendra";
import * as Layer from "effect/Layer";
import { makeKendraIndexHttpBinding } from "./BindingHttp.js";
import { SubmitFeedback } from "./SubmitFeedback.js";
export const SubmitFeedbackHttp = Layer.effect(SubmitFeedback, makeKendraIndexHttpBinding({
    tag: "AWS.Kendra.SubmitFeedback",
    operation: kendra.submitFeedback,
    actions: ["kendra:SubmitFeedback"],
}));
//# sourceMappingURL=SubmitFeedbackHttp.js.map