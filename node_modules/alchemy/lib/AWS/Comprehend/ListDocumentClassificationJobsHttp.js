import * as comprehend from "@distilled.cloud/aws/comprehend";
import * as Layer from "effect/Layer";
import { makeComprehendHttpBinding } from "./BindingHttp.js";
import { ListDocumentClassificationJobs } from "./ListDocumentClassificationJobs.js";
export const ListDocumentClassificationJobsHttp = Layer.effect(ListDocumentClassificationJobs, makeComprehendHttpBinding({
    tag: "AWS.Comprehend.ListDocumentClassificationJobs",
    operation: comprehend.listDocumentClassificationJobs,
    actions: ["comprehend:ListDocumentClassificationJobs"],
}));
//# sourceMappingURL=ListDocumentClassificationJobsHttp.js.map