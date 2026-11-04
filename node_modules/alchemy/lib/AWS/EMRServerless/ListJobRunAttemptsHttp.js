import * as emr from "@distilled.cloud/aws/emr-serverless";
import * as Layer from "effect/Layer";
import { makeEmrServerlessHttpBinding } from "./BindingHttp.js";
import { ListJobRunAttempts } from "./ListJobRunAttempts.js";
export const ListJobRunAttemptsHttp = Layer.effect(ListJobRunAttempts, makeEmrServerlessHttpBinding({
    tag: "AWS.EMRServerless.ListJobRunAttempts",
    operation: emr.listJobRunAttempts,
    actions: ["emr-serverless:ListJobRunAttempts"],
    subresources: ["/jobruns/*"],
}));
//# sourceMappingURL=ListJobRunAttemptsHttp.js.map