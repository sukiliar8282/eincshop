import * as comprehend from "@distilled.cloud/aws/comprehend";
import * as Layer from "effect/Layer";
import { makeComprehendStartJobHttpBinding } from "./BindingHttp.js";
import { StartDocumentClassificationJob } from "./StartDocumentClassificationJob.js";
export const StartDocumentClassificationJobHttp = Layer.effect(StartDocumentClassificationJob, makeComprehendStartJobHttpBinding({
    tag: "AWS.Comprehend.StartDocumentClassificationJob",
    operation: comprehend.startDocumentClassificationJob,
    actions: ["comprehend:StartDocumentClassificationJob"],
}));
//# sourceMappingURL=StartDocumentClassificationJobHttp.js.map