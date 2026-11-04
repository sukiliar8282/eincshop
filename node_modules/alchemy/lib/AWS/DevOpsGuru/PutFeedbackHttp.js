import * as devopsguru from "@distilled.cloud/aws/devops-guru";
import * as Layer from "effect/Layer";
import { makeDevOpsGuruAccountHttpBinding } from "./BindingHttp.js";
import { PutFeedback } from "./PutFeedback.js";
export const PutFeedbackHttp = Layer.effect(PutFeedback, makeDevOpsGuruAccountHttpBinding({
    tag: "AWS.DevOpsGuru.PutFeedback",
    operation: devopsguru.putFeedback,
    actions: ["devops-guru:PutFeedback"],
}));
//# sourceMappingURL=PutFeedbackHttp.js.map